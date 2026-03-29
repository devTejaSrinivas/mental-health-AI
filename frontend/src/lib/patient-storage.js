const PATIENT_STORE_KEY = "kalravPatientStore";

const getDefaultStore = () => ({
  version: 1,
  activePatientId: null,
  patients: [],
  updatedAt: new Date().toISOString(),
});

export const getPatientStore = () => {
  try {
    const raw = localStorage.getItem(PATIENT_STORE_KEY);
    if (!raw) return getDefaultStore();

    const parsed = JSON.parse(raw);
    return {
      ...getDefaultStore(),
      ...parsed,
      patients: Array.isArray(parsed?.patients) ? parsed.patients : [],
    };
  } catch (error) {
    console.error("Failed to parse patient store:", error);
    return getDefaultStore();
  }
};

export const savePatientStore = (store) => {
  const normalizedStore = {
    ...getDefaultStore(),
    ...store,
    updatedAt: new Date().toISOString(),
    patients: Array.isArray(store?.patients) ? store.patients : [],
  };

  // Explicitly replace old object each time, as requested.
  localStorage.removeItem(PATIENT_STORE_KEY);
  localStorage.setItem(PATIENT_STORE_KEY, JSON.stringify(normalizedStore));

  return normalizedStore;
};

export const addPatientProfile = (patientProfile) => {
  const current = getPatientStore();
  const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const normalizedPatient = {
    id,
    name: patientProfile.name?.trim() || "Unnamed Patient",
    diagnosis: patientProfile.diagnosis?.trim() || "Not specified",
    currentMentalCondition:
      patientProfile.currentMentalCondition?.trim() || "Not specified",
    watchBehaviors: patientProfile.watchBehaviors?.trim() || "",
    therapistInsights: patientProfile.therapistInsights?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  const updatedStore = {
    ...current,
    activePatientId: id,
    patients: [...current.patients, normalizedPatient],
  };

  return savePatientStore(updatedStore);
};

export const getActivePatientContext = () => {
  const store = getPatientStore();
  const activePatient =
    store.patients.find((patient) => patient.id === store.activePatientId) ||
    store.patients[0];

  if (!activePatient) return null;

  return {
    patientId: activePatient.id,
    name: activePatient.name,
    diagnosis: activePatient.diagnosis,
    currentMentalCondition: activePatient.currentMentalCondition,
    watchBehaviors: activePatient.watchBehaviors,
    therapistInsights: activePatient.therapistInsights,
  };
};
