// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { joinDateTime, splitDateTime } from '../internal/utils/date-time';
import { isIsoDateOnly } from '../internal/utils/date-time';
import { normalizeTimeString } from '../internal/utils/date-time/join-date-time';
import { DateRangePickerProps } from './interfaces';
import { setTimeOffset, shiftTimeOffset } from './time-offset';

export function formatValue(
  value: null | DateRangePickerProps.Value,
  { timeOffset, dateOnly }: { timeOffset: { startDate?: number; endDate?: number }; dateOnly: boolean }
): null | DateRangePickerProps.Value {
  if (
    !value ||
    value.type === 'relative' ||
    (value.startDate === '' && value.endDate === '' && value.type === 'absolute')
  ) {
    return value;
  }
  if (dateOnly) {
    return {
      type: 'absolute',
      startDate: value.startDate.split('T')[0],
      endDate: value.endDate.split('T')[0],
    };
  }
  return setTimeOffset(value, timeOffset);
}

export function getDefaultMode(
  value: null | DateRangePickerProps.Value,
  relativeOptions: readonly DateRangePickerProps.RelativeOption[],
  rangeSelectorMode: DateRangePickerProps.RangeSelectorMode
) {
  if (value && value.type) {
    return value.type;
  }
  if (rangeSelectorMode === 'relative-only') {
    return 'relative';
  }
  if (rangeSelectorMode === 'absolute-only') {
    return 'absolute';
  }
  return relativeOptions.length > 0 ? 'relative' : 'absolute';
}

export function splitAbsoluteValue(
  value: null | DateRangePickerProps.AbsoluteValue
): DateRangePickerProps.PendingAbsoluteValue {
  if (!value) {
    return {
      start: { date: '', time: '' },
      end: { date: '', time: '' },
    };
  }
  return { start: splitDateTime(value.startDate), end: splitDateTime(value.endDate) };
}

export function joinAbsoluteValue(
  value: DateRangePickerProps.PendingAbsoluteValue
): DateRangePickerProps.AbsoluteValue {
  const startTime = normalizeTimeString(value.start.time || '00:00:00');
  const endTime = normalizeTimeString(value.end.time || '23:59:59');

  return {
    type: 'absolute',
    startDate: joinDateTime(value.start.date, startTime),
    endDate: joinDateTime(value.end.date, endTime),
  };
}

type NormalizedTimeOffset =
  | {
      startDate: number;
      endDate: number;
    }
  | {
      startDate: undefined;
      endDate: undefined;
    };

export function formatInitialValue(
  value: null | DateRangePickerProps.Value,
  dateOnly: boolean,
  normalizedTimeOffset: NormalizedTimeOffset
): DateRangePickerProps.Value | null {
  if (value?.type !== 'absolute') {
    return shiftTimeOffset(value, normalizedTimeOffset);
  }

  if (value.endDate === '' && value.startDate === '') {
    return value;
  }

  if (dateOnly) {
    return formatValue(value, { dateOnly, timeOffset: normalizedTimeOffset });
  }

  return isIsoDateOnly(value.startDate) && isIsoDateOnly(value.endDate)
    ? value
    : shiftTimeOffset(value, normalizedTimeOffset);
}
