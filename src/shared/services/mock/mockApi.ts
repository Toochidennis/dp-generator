// In-memory mock implementation of the API surface. Swapped in via USE_MOCKS.
// Mutations persist for the lifetime of the page session.

import {
  composeAttendanceCanvas,
  canvasToPngBlob,
  canvasToPdfBlob,
  styleForTemplate,
} from "@/shared/utils/attendanceComposer";
import { readFileAsDataUrl } from "@/shared/utils/fileHelpers";
import { formatDateRange } from "@/shared/utils/format";
import type {
  CreateProgramPayload,
  CreateTemplatePayload,
  GenerateAttendancePayload,
  GenerateAttendanceResult,
  Generation,
  Program,
  ProgramTemplate,
  PublicGeneration,
  UpdateProgramPayload,
} from "@/shared/types/domain";
import { interpolateAttendanceText } from "@/shared/types/domain";
import { seedGenerations, seedPrograms, seedTemplates, mockHelpers, type ProgramSeed } from "@/shared/services/mock/mockData";

// Cloned so mutations don't touch the seed module. Templates live in their
// own flat store (a template may not belong to any program yet) and are
// joined onto a program only when a Program object is actually returned.
let programsBase: ProgramSeed[] = structuredClone(seedPrograms);
let templates: ProgramTemplate[] = structuredClone(seedTemplates);
let generations: Generation[] = structuredClone(seedGenerations);

const delay = <T>(value: T, ms = 450): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const clone = <T>(value: T): T => structuredClone(value);
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

function requireProgramBase(id: string): ProgramSeed {
  const program = programsBase.find((item) => item.id === id);
  if (!program) throw new Error("Program not found.");
  return program;
}

function withTemplates(program: ProgramSeed): Program {
  return { ...program, templates: templates.filter((t) => t.programId === program.id) };
}

// ---- Programs ----

export const getPrograms = () => delay(clone(programsBase.map(withTemplates)));

export const getProgramById = (id: string) => delay(clone(withTemplates(requireProgramBase(id))));

export const getProgramBySlug = (slug: string) => {
  const program = programsBase.find((item) => item.slug === slug);
  if (!program) return Promise.reject(new Error("This program link could not be found."));
  if (program.status === "archived") return Promise.reject(new Error("This program link is no longer active."));
  return delay(clone(withTemplates(program)));
};

export const createProgram = (payload: CreateProgramPayload) => {
  const program: ProgramSeed = {
    id: uid("prog"),
    title: payload.title,
    slug: payload.slug,
    description: payload.description,
    startDate: payload.startDate,
    endDate: payload.endDate,
    bannerUrl: payload.bannerUrl,
    status: payload.status,
    attendanceText: payload.attendanceText,
    generationCount: 0,
    createdAt: mockHelpers.now(),
  };
  programsBase = [program, ...programsBase];
  return delay(clone(withTemplates(program)));
};

export const updateProgram = (id: string, payload: UpdateProgramPayload) => {
  const program = requireProgramBase(id);
  Object.assign(program, payload);
  return delay(clone(withTemplates(program)));
};

export const archiveProgram = (id: string) => {
  const program = requireProgramBase(id);
  program.status = "archived";
  return delay(clone(withTemplates(program)));
};

// ---- Templates ----
// A template may exist with no programId (not yet assigned to any program).

export const getTemplates = () => delay(clone(templates));

export const getUnassignedTemplates = () => delay(clone(templates.filter((t) => !t.programId)));

export const getTemplatesByProgram = (programId: string) => {
  requireProgramBase(programId);
  return delay(clone(templates.filter((t) => t.programId === programId)));
};

export const createTemplate = (payload: CreateTemplatePayload) => {
  const programId = payload.programId || null;
  if (programId) requireProgramBase(programId);
  const siblingCount = programId ? templates.filter((t) => t.programId === programId).length : 0;
  const isDefault = programId ? (payload.isDefault ?? siblingCount === 0) : false;

  const template: ProgramTemplate = {
    id: uid("temp"),
    programId,
    name: payload.name,
    previewUrl: payload.previewUrl || mockHelpers.templatePreview("ATTENDANCE", "#4267b2", "#159568"),
    type: payload.type,
    status: payload.status ?? "active",
    isDefault,
  };
  if (isDefault) templates.forEach((item) => { if (item.programId === programId) item.isDefault = false; });
  templates = [...templates, template];
  return delay(clone(template));
};

export const setDefaultTemplate = (programId: string, templateId: string) => {
  requireProgramBase(programId);
  templates.forEach((item) => { if (item.programId === programId) item.isDefault = item.id === templateId; });
  return delay(clone(templates.filter((t) => t.programId === programId)));
};

export const assignTemplate = (templateId: string, programId: string) => {
  requireProgramBase(programId);
  const template = templates.find((item) => item.id === templateId);
  if (!template) throw new Error("Template not found.");
  const hasDefaultAlready = templates.some((item) => item.programId === programId && item.isDefault);
  template.programId = programId;
  template.isDefault = !hasDefaultAlready;
  return delay(clone(template));
};

// ---- Generations ----

export const getGenerations = () =>
  delay(clone([...generations].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))));

export const getGenerationsByProgram = (programId: string) =>
  delay(clone(generations.filter((item) => item.programId === programId)));

export async function generateAttendance(
  slug: string,
  payload: GenerateAttendancePayload,
): Promise<GenerateAttendanceResult> {
  const program = programsBase.find((item) => item.slug === slug);
  if (!program) throw new Error("Program not found.");
  const programTemplates = templates.filter((t) => t.programId === program.id);
  const template = programTemplates.find((item) => item.id === payload.templateId) ?? programTemplates[0];

  const photoUrl = payload.photo ? await readFileAsDataUrl(payload.photo) : undefined;
  const canvas = await composeAttendanceCanvas({
    programTitle: program.title,
    attendanceText: interpolateAttendanceText(program.attendanceText, { name: payload.name, programName: program.title }),
    participantName: payload.name,
    dateLabel: formatDateRange(program.startDate, program.endDate),
    photoUrl,
    style: styleForTemplate(template?.id, template?.name),
  });

  const [pngBlob] = await Promise.all([canvasToPngBlob(canvas)]);
  const pdfBlob = canvasToPdfBlob(canvas);
  const imageUrl = URL.createObjectURL(pngBlob);
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const generation: Generation = {
    id: uid("gen"),
    programId: program.id,
    programTitle: program.title,
    templateId: template?.id ?? "temp_unknown",
    templateName: template?.name,
    participantName: payload.name,
    generatedAt: mockHelpers.now(),
    pdfUrl,
    imageUrl,
    expiresAt: undefined,
  };
  generations = [generation, ...generations];
  program.generationCount = (program.generationCount ?? 0) + 1;

  return delay({ generationId: generation.id, pdfUrl, imageUrl, expiresAt: generation.expiresAt }, 900);
}

// ---- Public generations (share page) ----

export function getPublicGeneration(generationId: string): Promise<PublicGeneration> {
  const generation = generations.find((item) => item.id === generationId);
  if (!generation) return Promise.reject(new Error("This attendance card does not exist."));

  const program = programsBase.find((item) => item.id === generation.programId);
  if (!program) return Promise.reject(new Error("Program not found."));

  if (generation.expiresAt && new Date(generation.expiresAt) < new Date()) {
    return Promise.reject(new Error("This attendance card is no longer available."));
  }

  const publicGen: PublicGeneration = {
    id: generation.id,
    participantName: generation.participantName,
    programName: generation.programTitle ?? program.title,
    programSlug: program.slug,
    attendanceText: interpolateAttendanceText(program.attendanceText, {
      name: generation.participantName,
      programName: generation.programTitle ?? program.title,
    }),
    imageUrl: generation.imageUrl ?? mockHelpers.templatePreview("ATTENDANCE", "#4267b2", "#159568"),
    pdfUrl: generation.pdfUrl ?? "#",
    createdAt: generation.generatedAt,
    expiresAt: generation.expiresAt,
  };

  return delay(publicGen);
}
