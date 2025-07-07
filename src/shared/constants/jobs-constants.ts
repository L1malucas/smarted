import { IJobStatus } from '@/domain/models/JobStatus';

export const jobStatusOptions = [
  { value: IJobStatus.All, label: "Todos os Status" },
  { value: IJobStatus.Open, label: "Aberta" },
  { value: IJobStatus.Recruitment, label: "Recrutamento" },
  { value: IJobStatus.Screening, label: "Triagem" },
  { value: IJobStatus.Evaluation, label: "Avaliação" },
  { value: IJobStatus.Contact, label: "Contato" },
  { value: IJobStatus.Closed, label: "Vaga Fechada" },
  { value: IJobStatus.Draft, label: "Rascunho" },
];
