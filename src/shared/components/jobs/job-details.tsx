"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../ui/button";
import { ArrowLeft, Briefcase, Calendar, Users, Edit } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge";
import { ShareDialog } from "../share-dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { IJobDetailsProps } from "@/shared/types/types/component-props";
import { getStatusBadge } from "@/shared/lib/job-status-config";

export function JobDetails({ job, tenantSlug }: IJobDetailsProps) {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${tenantSlug}/jobs`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(job.status)}
              <span className="text-sm text-muted-foreground">
                Criada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${tenantSlug}/jobs/${job._id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Vaga
            </Link>
          </Button>
          <ShareDialog
            title={`Compartilhar Vaga: ${job.title}`}
            resourceType="job"
            resourceId={job._id!}
            resourceName={job.title}
            tenantSlug={tenantSlug}
            jobSlug={job.slug}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descrição da Vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{job.description}</p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Criada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{job.candidatesCount} candidatos</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">ID: {job._id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Critérios de Avaliação</CardTitle>
          <CardDescription>Pesos utilizados para avaliar os candidatos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Experiência</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.experience}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights.experience}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Habilidades</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.skills}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights.skills}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Certificações</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.certifications}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights.certifications}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Comportamental</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.behavioral}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights.behavioral}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Liderança</div>
              <div className="text-2xl font-bold">{job.criteriaWeights.leadership}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${job.criteriaWeights?.leadership}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {job.competencies && job.competencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {job.competencies.map((comp) => (
                <div key={comp.id} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <span className="font-medium">{comp.name}</span>
                    {comp.weight >= 4 && (
                      <Badge variant="outline" className="ml-2">
                        Obrigatória
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary">Peso: {comp.weight}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {job.questions && job.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Perguntas para Candidatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {job.questions.map((q, index) => (
                <div key={q.id} className="p-3 border rounded-md">
                  <p className="font-medium">
                    {index + 1}. {q.question}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tipo: {q.type}
                  </p>
                  {["multiple_choice", "single_choice"].includes(q.type) && q.options && (
                    <div className="mt-2 pl-4">
                      <p className="text-sm font-medium">Opções:</p>
                      <ul className="list-disc pl-4 text-sm">
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
