export enum JobStatus {
  All = "all",
  Open = "aberta",
  Recruitment = "recrutamento",
  Screening = "triagem",
  Evaluation = "avaliação",
  Contact = "contato",
  Closed = "vaga fechada",
  Draft = "draft",
}

export const jobStatusOptions = [
  { value: JobStatus.All, label: "Todos os Status" },
  { value: JobStatus.Open, label: "Aberta" },
  { value: JobStatus.Recruitment, label: "Recrutamento" },
  { value: JobStatus.Screening, label: "Triagem" },
  { value: JobStatus.Evaluation, label: "Avaliação" },
  { value: JobStatus.Contact, label: "Contato" },
  { value: JobStatus.Closed, label: "Vaga Fechada" },
  { value: JobStatus.Draft, label: "Rascunho" },
];