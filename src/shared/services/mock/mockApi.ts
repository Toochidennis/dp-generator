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
import { seedGenerations, seedPrograms, mockHelpers } from "@/shared/services/mock/mockData";

// Cloned so mutations don't touch the seed module.
let programs: Program[] = structuredClone(seedPrograms);
let generations: Generation[] = structuredClone(seedGenerations);

const delay = <T>(value: T, ms = 450): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const clone = <T>(value: T): T => structuredClone(value);
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

function requireProgram(id: string): Program {
  const program = programs.find((item) => item.id === id);
  if (!program) throw new Error("Program not found.");
  return program;
}

// ---- Programs ----

export const getPrograms = () => delay(clone(programs));

export const getProgramById = (id: string) => delay(clone(requireProgram(id)));

export const getProgramBySlug = (slug: string) => {
  const program = programs.find((item) => item.slug === slug);
  if (!program) return Promise.reject(new Error("This program link could not be found."));
  if (program.status === "archived") return Promise.reject(new Error("This program link is no longer active."));
  return delay(clone(program));
};

export const createProgram = (payload: CreateProgramPayload) => {
  const program: Program = {
    id: uid("prog"),
    title: payload.title,
    slug: payload.slug,
    description: payload.description,
    startDate: payload.startDate,
    endDate: payload.endDate,
    bannerUrl: payload.bannerUrl,
    status: payload.status,
    attendanceText: payload.attendanceText,
    templates: [],
    generationCount: 0,
    createdAt: mockHelpers.now(),
  };
  programs = [program, ...programs];
  return delay(clone(program));
};

export const updateProgram = (id: string, payload: UpdateProgramPayload) => {
  const program = requireProgram(id);
  Object.assign(program, payload);
  return delay(clone(program));
};

export const archiveProgram = (id: string) => {
  const program = requireProgram(id);
  program.status = "archived";
  return delay(clone(program));
};

// ---- Templates ----

export const getTemplates = () =>
  delay(clone(programs.flatMap((program) => program.templates)));

export const getTemplatesByProgram = (programId: string) =>
  delay(clone(requireProgram(programId).templates));

export const createTemplate = (payload: CreateTemplatePayload) => {
  const program = requireProgram(payload.programId);
  const template: ProgramTemplate = {
    id: uid("temp"),
    programId: payload.programId,
    name: payload.name,
    previewUrl: payload.previewUrl || mockHelpers.templatePreview("ATTENDANCE", "#4267b2", "#159568"),
    type: payload.type,
    status: payload.status ?? "active",
    isDefault: payload.isDefault ?? program.templates.length === 0,
  };
  if (template.isDefault) program.templates.forEach((item) => (item.isDefault = false));
  program.templates = [...program.templates, template];
  return delay(clone(template));
};

export const setDefaultTemplate = (programId: string, templateId: string) => {
  const program = requireProgram(programId);
  program.templates.forEach((item) => (item.isDefault = item.id === templateId));
  return delay(clone(program.templates));
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
  const program = programs.find((item) => item.slug === slug);
  if (!program) throw new Error("Program not found.");
  const template = program.templates.find((item) => item.id === payload.templateId) ?? program.templates[0];

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

  const program = programs.find((item) => item.id === generation.programId);
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
