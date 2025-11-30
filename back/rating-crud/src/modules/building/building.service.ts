import * as buildingRepository from './building.repository.js';
import type { Building, BuildingWithSummary, CreateBuildingInput, SearchBuildingsQuery } from './building.types.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function list(query: SearchBuildingsQuery): Promise<Building[]> {
  return buildingRepository.findAll(query);
}

export async function getById(id: string): Promise<BuildingWithSummary> {
  const building = await buildingRepository.findByIdWithSummary(id);
  if (!building) {
    throw new NotFoundError(`Building not found: ${id}`);
  }
  return building;
}

export async function create(input: CreateBuildingInput): Promise<Building> {
  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError('Building name is required');
  }
  if (!input.address || input.address.trim().length === 0) {
    throw new ValidationError('Building address is required');
  }

  return buildingRepository.create({
    name: input.name.trim(),
    address: input.address.trim(),
    priceRange: input.priceRange?.trim(),
    description: input.description?.trim(),
  });
}

export async function exists(id: string): Promise<boolean> {
  return buildingRepository.exists(id);
}
