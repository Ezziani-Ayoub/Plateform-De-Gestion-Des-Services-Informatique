import { useState, useCallback, useEffect } from 'react';
import { Equipment, CreateEquipmentPayload, UpdateEquipmentPayload, PageResponse } from '../types';
import { equipmentService, EquipmentFilterParams } from '../services/equipment.service';

export const useEquipment = (initialParams: EquipmentFilterParams = {}) => {
  const [params, setParams] = useState<EquipmentFilterParams>({
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
    ...initialParams
  });
  const [data, setData] = useState<PageResponse<Equipment> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await equipmentService.getEquipments(params);
      setData(result);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch equipment records';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  const createEquipment = async (payload: CreateEquipmentPayload) => {
    setIsLoading(true);
    try {
      const created = await equipmentService.createEquipment(payload);
      await fetchEquipments();
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create equipment';
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEquipment = async (id: number, payload: UpdateEquipmentPayload) => {
    setIsLoading(true);
    try {
      const updated = await equipmentService.updateEquipment(id, payload);
      await fetchEquipments();
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update equipment';
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEquipment = async (id: number) => {
    setIsLoading(true);
    try {
      await equipmentService.deleteEquipment(id);
      await fetchEquipments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete equipment';
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    equipments: data?.content || [],
    pageData: data,
    params,
    setParams,
    isLoading,
    error,
    refresh: fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment
  };
};
