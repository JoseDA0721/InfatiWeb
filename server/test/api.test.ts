import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { openDatabase, type DB } from '../src/db/index.js';
import { DEMO, seedDatabase } from '../src/seed/seed.js';

let db: DB;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  db = openDatabase(':memory:');
  seedDatabase(db);
  app = createApp(db);
});

async function childAgent(name = DEMO.sofia.name, password = DEMO.sofia.password) {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/child-login').send({ name, password });
  expect(res.status).toBe(200);
  return agent;
}

async function familyAgent() {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/family-login').send({ username: DEMO.family.username, pin: DEMO.family.pin });
  expect(res.status).toBe(200);
  return agent;
}

const optionsOf = (questionId: number) =>
  db.prepare('SELECT id, is_correct FROM options WHERE question_id = ?').all(questionId) as { id: number; is_correct: number }[];

const questionsOf = (activityId: number) =>
  db.prepare('SELECT id FROM questions WHERE activity_id = ? ORDER BY position').all(activityId) as { id: number }[];

describe('acceso', () => {
  it('acepta el nombre sin distinguir mayúsculas ni tildes', async () => {
    const res = await request(app).post('/api/auth/child-login').send({ name: '  SOFIA ', password: DEMO.sofia.password });
    expect(res.status).toBe(200);
    expect(res.body.child.tutorialDone).toBe(false);
  });

  it('acepta la clave con imágenes', async () => {
    const res = await request(app).post('/api/auth/child-login').send({ name: 'Mateo', pictures: DEMO.mateo.pictures });
    expect(res.status).toBe(200);
  });

  it('usa un mensaje genérico y bloquea tras 5 intentos', async () => {
    for (let i = 0; i < 4; i += 1) {
      const res = await request(app).post('/api/auth/child-login').send({ name: 'Mateo', password: 'mal' });
      expect(res.status).toBe(401);
      expect(res.body.attemptsLeft).toBe(4 - i);
    }
    const locked = await request(app).post('/api/auth/child-login').send({ name: 'Mateo', password: 'mal' });
    expect(locked.status).toBe(423);
    const stillLocked = await request(app).post('/api/auth/child-login').send({ name: 'Mateo', password: DEMO.mateo.password });
    expect(stillLocked.status).toBe(423);
  });

  it('un adulto restablece la clave del niño con su PIN', async () => {
    const res = await request(app).post('/api/auth/reset-request').send({
      childName: 'Sofía',
      familyUsername: DEMO.family.username,
      pin: DEMO.family.pin,
      newPassword: 'nueva1',
    });
    expect(res.status).toBe(200);
    await childAgent('Sofía', 'nueva1');
  });

  it('recupera el PIN con la pregunta de seguridad', async () => {
    const q = await request(app).post('/api/auth/pin-question').send({ username: DEMO.family.username });
    expect(q.body.question).toContain('mascota');
    const res = await request(app)
      .post('/api/auth/pin-recovery')
      .send({ username: DEMO.family.username, answer: 'canela', newPin: '1357' });
    expect(res.status).toBe(200);
    const login = await request(app).post('/api/auth/family-login').send({ username: DEMO.family.username, pin: '1357' });
    expect(login.status).toBe(200);
  });

  it('protege las rutas del niño', async () => {
    expect((await request(app).get('/api/home')).status).toBe(401);
    expect((await request(app).get('/api/attempts/1')).status).toBe(401);
  });

  it('responde 404 a rutas de la API que no existen', async () => {
    expect((await request(app).get('/api/no-existe')).status).toBe(404);
  });
});

describe('actividades y gamificación', () => {
  it('nunca revela la respuesta correcta al cargar la actividad', async () => {
    const agent = await childAgent();
    const map = await agent.get('/api/map');
    const first = map.body.modules[0].activities[0];
    const activity = await agent.get(`/api/activities/${first.id}`);
    expect(JSON.stringify(activity.body)).not.toMatch(/is_correct|correct/);
  });

  it('bloquea actividades que aún no se abren', async () => {
    const agent = await childAgent();
    const map = await agent.get('/api/map');
    const second = map.body.modules[0].activities[1];
    expect(second.status).toBe('bloqueada');
    expect((await agent.post('/api/attempts').send({ activityId: second.id })).status).toBe(403);
  });

  it('un error no resta: pista, reintento y cierre con estrellas, XP, insignias y sticker', async () => {
    const agent = await childAgent();
    const map = await agent.get('/api/map');
    const activityId = map.body.modules[0].activities[0].id as number;
    const { body: start } = await agent.post('/api/attempts').send({ activityId });

    for (const [index, q] of questionsOf(activityId).entries()) {
      const opts = optionsOf(q.id);
      if (index === 0) {
        const wrong = await agent
          .post(`/api/attempts/${start.attemptId}/answers`)
          .send({ questionId: q.id, optionId: opts.find((o) => !o.is_correct)!.id });
        expect(wrong.body).toMatchObject({ correct: false, resolved: false, hintLevel: 1 });
        expect(wrong.body.hint).toBeTruthy();
      }
      const right = await agent
        .post(`/api/attempts/${start.attemptId}/answers`)
        .send({ questionId: q.id, optionId: opts.find((o) => o.is_correct)!.id, hintsUsed: index === 0 ? 1 : 0 });
      expect(right.body.correct).toBe(true);
      expect(right.body.stars).toBe(index === 0 ? 2 : 3);
    }

    const finish = await agent.post(`/api/attempts/${start.attemptId}/finish`);
    expect(finish.status).toBe(200);
    expect(finish.body.stars).toBe(3);
    expect(finish.body.xp.total).toBe(80 + 20 + 5);
    expect(finish.body.badges.map((b: { code: string }) => b.code)).toEqual(
      expect.arrayContaining(['primer_paso', 'valiente', 'detective_alegria']),
    );
    expect(finish.body.sticker.code).toBe('sticker_alegria');
    expect(finish.body.weekly.completed).toBe(1);

    const after = await agent.get('/api/map');
    expect(after.body.modules[0].activities[1].status).toBe('nueva');
  });

  it('tras tres fallos muestra la respuesta con 1 estrella', async () => {
    const agent = await childAgent();
    const map = await agent.get('/api/map');
    const activityId = map.body.modules[0].activities[0].id as number;
    const { body: start } = await agent.post('/api/attempts').send({ activityId });
    const q = questionsOf(activityId)[0];
    const wrong = optionsOf(q.id).find((o) => !o.is_correct)!.id;
    const send = () => agent.post(`/api/attempts/${start.attemptId}/answers`).send({ questionId: q.id, optionId: wrong });
    expect((await send()).body.hintLevel).toBe(1);
    expect((await send()).body.hintLevel).toBe(2);
    const third = await send();
    expect(third.body).toMatchObject({ revealed: true, resolved: true, stars: 1 });
    expect(third.body.correctOptionIds).toHaveLength(1);
  });

  it('retoma un intento abierto', async () => {
    const agent = await childAgent();
    const map = await agent.get('/api/map');
    const activityId = map.body.modules[0].activities[0].id as number;
    const { body: first } = await agent.post('/api/attempts').send({ activityId });
    const q = questionsOf(activityId)[0];
    const right = optionsOf(q.id).find((o) => o.is_correct)!.id;
    await agent.post(`/api/attempts/${first.attemptId}/answers`).send({ questionId: q.id, optionId: right });
    const { body: again } = await agent.post('/api/attempts').send({ activityId });
    expect(again).toMatchObject({ attemptId: first.attemptId, resumed: true });
    expect(again.resolved).toHaveLength(1);
  });

  it('guarda las preferencias de accesibilidad', async () => {
    const agent = await childAgent();
    const prefs = { fontScale: 'grande', highContrast: true, volume: 0.4, muted: false, voiceRate: 1.1, readMode: 'texto', reduceMotion: true };
    expect((await agent.put('/api/me/preferences').send(prefs)).body).toEqual(prefs);
    expect((await agent.get('/api/me/preferences')).body).toEqual(prefs);
  });
});

describe('familia', () => {
  it('ve el resumen semanal y las habilidades del niño vinculado', async () => {
    const agent = await familyAgent();
    const { body } = await agent.get('/api/family/children');
    expect(body.children).toHaveLength(2);
    const mateo = body.children.find((c: { name: string }) => c.name === 'Mateo');
    const summary = await agent.get(`/api/family/${mateo.id}/summary`);
    expect(summary.body.weekly.completed).toBe(4);
    const skills = await agent.get(`/api/family/${mateo.id}/skills`);
    expect(skills.body.skills).toHaveLength(4);
    for (const s of skills.body.skills) expect(['Muy bueno', 'Bueno', 'En progreso', 'Por explorar']).toContain(s.level);
    const recs = await agent.get(`/api/family/${mateo.id}/recommendations`);
    expect(recs.body.recommendations.length).toBeGreaterThanOrEqual(2);
    expect(recs.body.recommendations.length).toBeLessThanOrEqual(3);
  });

  it('no permite ver niños de otra familia', async () => {
    const agent = await familyAgent();
    expect((await agent.get('/api/family/9999/summary')).status).toBe(404);
  });

  it('recibe el aviso de «Necesito ayuda»', async () => {
    const child = await childAgent();
    await child.post('/api/help-requests').send({ context: 'Ayuda en el mapa' });
    const agent = await familyAgent();
    const { body } = await agent.get('/api/family/children');
    const sofia = body.children.find((c: { name: string }) => c.name === 'Sofía');
    const summary = await agent.get(`/api/family/${sofia.id}/summary`);
    expect(summary.body.helpRequests).toHaveLength(1);
  });
});
