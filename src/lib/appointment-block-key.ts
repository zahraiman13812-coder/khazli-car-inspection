export function createAppointmentDayBlockKey(
  dateKey: string,
) {
  return `${dateKey}:ALL`;
}

export function createAppointmentTimeBlockKey(
  dateKey: string,
  time: string,
) {
  return `${dateKey}:${time}`;
}

export function createAppointmentBlockKeys(
  dateKey: string,
  time: string,
) {
  return [
    createAppointmentDayBlockKey(
      dateKey,
    ),

    createAppointmentTimeBlockKey(
      dateKey,
      time,
    ),
  ];
}