-- Agrega el plan BASICO al enum PlanSuscripcion
ALTER TYPE "PlanSuscripcion" ADD VALUE IF NOT EXISTS 'BASICO' BEFORE 'PLUS';
