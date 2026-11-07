import Fastify from 'fastify';
import { z } from 'zod';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';

const app = Fastify({ logger: pino() });
const prisma = new PrismaClient();
const Pedido = z.object({ id: z.number() });

app.get('/orders/:id', async (req) => prisma.order.findUnique({ where: Pedido.parse(req.params) }));

export default app;
