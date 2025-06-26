// lib/export-utils.ts
import { DashboardData } from "@/types/dashboard-interface"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export const exportToPDF = async (
  data: DashboardData,
  tenantSlug: string,
  period: string,
  logoPath: string,
  headerText: string
) => {
  const doc = new jsPDF()

  // Definir cores
  const tealColor = [0, 102, 102] as [number, number, number]
  const yellowColor = [255, 215, 0] as [number, number, number]
  const lightGrayColor = [240, 240, 240] as [number, number, number]
  const whiteColor = [255, 255, 255] as [number, number, number]

  // CABEÇALHO ESTILIZADO
  // Fundo verde-azulado para informações da empresa
  doc.setFillColor(...tealColor)
  doc.rect(10, 10, 120, 25, 'F')

  // Texto do cabeçalho em branco
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Empresa', 12, 18)
  doc.setFont('helvetica', 'normal')
  doc.text('Endereço, Cidade, Estado e CEP', 12, 23)
  doc.text('Telefone Telefone Fax Fax', 12, 28)

  // Fundo amarelo para logo/nome
  doc.setFillColor(...yellowColor)
  doc.rect(135, 10, 55, 25, 'F')

  // Texto do logo em preto
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  if (logoPath) {
    // Carrega a imagem e insere no PDF (assume base64 ou URL de imagem)
    // jsPDF aceita base64 ou DataURL. Se logoPath for URL, precisa converter para base64 antes.
    // Aqui assume que logoPath já é base64 DataURL (ex: "data:image/png;base64,...")
    doc.addImage(logoPath, 'PNG', 140, 13, 45, 19)
  } else {
    doc.text('Nome do', 155, 20, { align: 'center' })
    doc.text('logotipo', 155, 26, { align: 'center' })
  }

  // TÍTULO PRINCIPAL
  doc.setTextColor(...tealColor)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RELATÓRIO DE STATUS DO PROJETO', 105, 50, { align: 'center' })

  // Reset cor do texto
  doc.setTextColor(0, 0, 0)

  let currentY = 65

  // SEÇÃO: RESUMO DO PROJETO
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...tealColor)
  doc.text('RESUMO DO PROJETO', 10, currentY)

  currentY += 5

  // Tabela de resumo do projeto
  autoTable(doc, {
    startY: currentY,
    head: [['DATA DO RELATÓRIO', new Date().toLocaleDateString('pt-BR'), 'PREPARADO POR', 'Sistema']],
    body: [['NOME DO PROJETO', `Dashboard ${tenantSlug}`, '', '']],
    theme: 'grid',
    headStyles: {
      fillColor: tealColor,
      textColor: whiteColor,
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fillColor: lightGrayColor,
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 45 },
      2: { cellWidth: 35 },
      3: { cellWidth: 45 }
    },
    margin: { left: 10, right: 10 }
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  // SEÇÃO: RELATÓRIO DO STATUS
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...tealColor)
  doc.text('RELATÓRIO DO STATUS', 10, currentY)

  currentY += 5

  // Caixa amarela com texto explicativo
  doc.setFillColor(...yellowColor)
  doc.rect(10, currentY, 180, 15, 'F')
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Relatório gerado automaticamente com dados do sistema de recrutamento.', 12, currentY + 6)
  doc.text('Período analisado: ' + period, 12, currentY + 11)

  currentY += 25

  // SEÇÃO: VISÃO GERAL DO PROJETO (MÉTRICAS)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...tealColor)
  doc.text('VISÃO GERAL DO PROJETO', 10, currentY)

  currentY += 5

  // Calcular métricas totais
  const metrics = data.metrics.reduce(
    (acc, item) => ({
      vagasCriadas: acc.vagasCriadas + item.vagasCriadas,
      candidatosCadastrados: acc.candidatosCadastrados + item.candidatosCadastrados,
      contatosRealizados: acc.contatosRealizados + item.contatosRealizados,
      matches: acc.matches + item.matches,
      acoesPendentes: acc.acoesPendentes + item.acoesPendentes,
    }),
    { vagasCriadas: 0, candidatosCadastrados: 0, contatosRealizados: 0, matches: 0, acoesPendentes: 0 }
  )

  // Tabela de métricas com estilo
  autoTable(doc, {
    startY: currentY,
    head: [['TAREFA', '% CONCLUÍDA', 'DATA DE ENTREGA', 'DRIVER', 'ANOTAÇÕES']],
    body: [
      ['Vagas Criadas', `${metrics.vagasCriadas}`, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Concluído'],
      ['Candidatos Cadastrados', `${metrics.candidatosCadastrados}`, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Concluído'],
      ['Contatos Realizados', `${metrics.contatosRealizados}`, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Concluído'],
      ['Matches Gerados', `${metrics.matches}`, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Concluído'],
      ['Ações Pendentes', `${metrics.acoesPendentes}`, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Em andamento']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: tealColor,
      textColor: whiteColor,
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: lightGrayColor
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 45 }
    },
    margin: { left: 10, right: 10 }
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  // SEÇÃO: ATIVIDADE DO USUÁRIO
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...tealColor)
  doc.text('ATIVIDADE DO USUÁRIO', 10, currentY)

  currentY += 5

  // Tabela de atividade do usuário
  autoTable(doc, {
    startY: currentY,
    head: [['DIA', 'LOGINS', 'AÇÕES']],
    body: data.userActivity.map((item) => [item.name, item.logins.toString(), item.acoes.toString()]),
    theme: 'grid',
    headStyles: {
      fillColor: tealColor,
      textColor: whiteColor,
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: lightGrayColor
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 }
    },
    margin: { left: 10, right: 10 }
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  // // SEÇÃO: CONCLUSÕES/RECOMENDAÇÕES
  // doc.setFontSize(12)
  // doc.setFont('helvetica', 'bold')
  // doc.setTextColor(...tealColor)
  // doc.text('CONCLUSÕES/RECOMENDAÇÕES', 10, currentY)

  // currentY += 5

  // // Caixa amarela com conclusões
  // doc.setFillColor(...yellowColor)
  // doc.rect(10, currentY, 180, 20, 'F')
  // doc.setTextColor(0, 0, 0)
  // doc.setFont('helvetica', 'bold')
  // doc.setFontSize(9)
  // doc.text('O sistema apresenta performance satisfatória no período analisado.', 12, currentY + 6)
  // doc.text(`Total de ${metrics.vagasCriadas} vagas criadas e ${metrics.candidatosCadastrados} candidatos cadastrados.`, 12, currentY + 11)
  // doc.text(`Recomenda-se manter o ritmo atual de ${metrics.matches} matches gerados.`, 12, currentY + 16)

  // RODAPÉ COM DIREITOS AUTORAIS
  const pageHeight = doc.internal.pageSize.height
  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Linha horizontal
    doc.setDrawColor(...tealColor)
    doc.setLineWidth(0.5)
    doc.line(10, pageHeight - 25, 200, pageHeight - 25)

    // Texto do rodapé
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('© 2025 - Todos os direitos reservados', 105, pageHeight - 20, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.text('Este documento é confidencial e propriedade da empresa. Reprodução ou distribuição não autorizada é proibida.', 105, pageHeight - 16, { align: 'center' })
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} | Página ${i} de ${pageCount}`, 105, pageHeight - 12, { align: 'center' })
  }

  doc.save(`relatorio-status-${tenantSlug}-${period}.pdf`)
}

export const exportToExcel = async (
  data: DashboardData,
  tenantSlug: string,
  period: string
) => {
  const workbook = XLSX.utils.book_new()

  // Calcular métricas totais
  const metrics = data.metrics.reduce(
    (acc, item) => ({
      vagasCriadas: acc.vagasCriadas + item.vagasCriadas,
      candidatosCadastrados: acc.candidatosCadastrados + item.candidatosCadastrados,
      contatosRealizados: acc.contatosRealizados + item.contatosRealizados,
      matches: acc.matches + item.matches,
      acoesPendentes: acc.acoesPendentes + item.acoesPendentes,
    }),
    { vagasCriadas: 0, candidatosCadastrados: 0, contatosRealizados: 0, matches: 0, acoesPendentes: 0 }
  )

  // Planilha de métricas
  const metricsData = [
    ['Métrica', 'Valor'],
    ['Vagas Criadas', metrics.vagasCriadas],
    ['Candidatos Cadastrados', metrics.candidatosCadastrados],
    ['Contatos Realizados', metrics.contatosRealizados],
    ['Matches Gerados', metrics.matches],
    ['Ações Pendentes', metrics.acoesPendentes],
  ]
  const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData)
  XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métricas')

  // Planilha de atividade do usuário
  const userActivityData = [
    ['Dia', 'Logins', 'Ações'],
    ...data.userActivity.map((item) => [item.name, item.logins, item.acoes]),
  ]
  const userActivitySheet = XLSX.utils.aoa_to_sheet(userActivityData)
  XLSX.utils.book_append_sheet(workbook, userActivitySheet, 'Atividade do Usuário')

  XLSX.writeFile(workbook, `relatorio-${tenantSlug}-${period}.xlsx`)
}