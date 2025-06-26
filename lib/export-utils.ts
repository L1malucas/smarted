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

  // ====== PLANILHA PRINCIPAL - RELATÓRIO COMPLETO ======
  const mainSheetData = [
    // Cabeçalho da empresa
    ['EMPRESA', '', '', '', ''],
    ['Endereço, Cidade, Estado e CEP', '', '', '', ''],
    ['Telefone Telefone Fax Fax', '', '', 'Nome do', 'logotipo'],
    ['', '', '', '', ''],
    // Título principal
    ['RELATÓRIO DE STATUS DO PROJETO', '', '', '', ''],
    ['', '', '', '', ''],
    // Resumo do projeto
    ['RESUMO DO PROJETO', '', '', '', ''],
    ['DATA DO RELATÓRIO', new Date().toLocaleDateString('pt-BR'), 'PREPARADO POR', 'Sistema', ''],
    ['NOME DO PROJETO', `Dashboard ${tenantSlug}`, '', '', ''],
    ['', '', '', '', ''],
    // Relatório do status
    ['RELATÓRIO DO STATUS', '', '', '', ''],
    ['Relatório gerado automaticamente com dados do sistema de recrutamento.', '', '', '', ''],
    [`Período analisado: ${period}`, '', '', '', ''],
    ['', '', '', '', ''],
    // Visão geral do projeto
    ['VISÃO GERAL DO PROJETO', '', '', '', ''],
    ['TAREFA', '% CONCLUÍDA', 'DATA DE ENTREGA', 'DRIVER', 'ANOTAÇÕES'],
    ['Vagas Criadas', metrics.vagasCriadas, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Concluído'],
    ['Candidatos Cadastrados', metrics.candidatosCadastrados, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Concluído'],
    ['Contatos Realizados', metrics.contatosRealizados, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Concluído'],
    ['Matches Gerados', metrics.matches, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Concluído'],
    ['Ações Pendentes', metrics.acoesPendentes, new Date().toLocaleDateString('pt-BR'), 'Sistema', 'Em andamento'],
    ['', '', '', '', ''],
    // Atividade do usuário
    ['ATIVIDADE DO USUÁRIO', '', '', '', ''],
    ['DIA', 'LOGINS', 'AÇÕES', '', ''],
    ...data.userActivity.map((item) => [item.name, item.logins, item.acoes, '', '']),
    ['', '', '', '', ''],
    // Conclusões
    ['CONCLUSÕES/RECOMENDAÇÕES', '', '', '', ''],
    ['O sistema apresenta performance satisfatória no período analisado.', '', '', '', ''],
    [`Total de ${metrics.vagasCriadas} vagas criadas e ${metrics.candidatosCadastrados} candidatos cadastrados.`, '', '', '', ''],
    [`Recomenda-se manter o ritmo atual de ${metrics.matches} matches gerados.`, '', '', '', ''],
    ['', '', '', '', ''],
    // Rodapé
    ['© 2025 - Todos os direitos reservados', '', '', '', ''],
    ['Este documento é confidencial e propriedade da empresa.', '', '', '', ''],
    [`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, '', '', '', ''],
  ]

  const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData)

  // ====== APLICAR ESTILOS ======

  // Definir cores em formato hex
  const tealColor = '006666'
  const yellowColor = 'FFD700'
  const lightGrayColor = 'F0F0F0'

  // Função para aplicar estilo a uma célula
  const applyCellStyle = (ws: any, cellRef: string, style: any) => {
    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' }
    ws[cellRef].s = style
  }

  // Estilo para cabeçalhos principais (verde-azulado)
  const headerStyle = {
    fill: { fgColor: { rgb: tealColor } },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  }

  // Estilo para título principal
  const titleStyle = {
    font: { bold: true, color: { rgb: tealColor }, sz: 16 },
    alignment: { horizontal: 'center', vertical: 'center' }
  }

  // Estilo para seções (subtítulos)
  const sectionStyle = {
    font: { bold: true, color: { rgb: tealColor }, sz: 12 },
    alignment: { horizontal: 'left', vertical: 'center' }
  }

  // Estilo para caixas amarelas
  const yellowBoxStyle = {
    fill: { fgColor: { rgb: yellowColor } },
    font: { bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  }

  // Estilo para linhas alternadas (cinza claro)
  const alternateRowStyle = {
    fill: { fgColor: { rgb: lightGrayColor } },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  }

  // Estilo para bordas normais
  const normalBorderStyle = {
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  }

  // Aplicar estilos às células específicas

  // Cabeçalho da empresa (linhas 1-3)
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })
      applyCellStyle(mainSheet, cellRef, headerStyle)
    }
  }

  // Logo (colunas D-E, linhas 1-3)
  for (let row = 1; row <= 3; row++) {
    for (let col = 4; col <= 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })
      applyCellStyle(mainSheet, cellRef, yellowBoxStyle)
    }
  }

  // Título principal (linha 5)
  applyCellStyle(mainSheet, 'A5', titleStyle)

  // Seções
  applyCellStyle(mainSheet, 'A7', sectionStyle) // RESUMO DO PROJETO
  applyCellStyle(mainSheet, 'A11', sectionStyle) // RELATÓRIO DO STATUS
  applyCellStyle(mainSheet, 'A15', sectionStyle) // VISÃO GERAL DO PROJETO
  applyCellStyle(mainSheet, 'A23', sectionStyle) // ATIVIDADE DO USUÁRIO
  applyCellStyle(mainSheet, 'A27', sectionStyle) // CONCLUSÕES

  // Cabeçalhos das tabelas
  // Tabela do projeto (linha 16)
  for (let col = 1; col <= 5; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 15, c: col - 1 })
    applyCellStyle(mainSheet, cellRef, headerStyle)
  }

  // Dados da tabela do projeto (linhas 17-21) - alternando cores
  for (let row = 17; row <= 21; row++) {
    const isEven = (row - 17) % 2 === 0
    const style = isEven ? alternateRowStyle : normalBorderStyle
    for (let col = 1; col <= 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })
      applyCellStyle(mainSheet, cellRef, style)
    }
  }

  // Cabeçalho da tabela de atividade (linha 24)
  for (let col = 1; col <= 3; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 23, c: col - 1 })
    applyCellStyle(mainSheet, cellRef, headerStyle)
  }

  // Dados da tabela de atividade - alternando cores
  const activityStartRow = 25
  for (let i = 0; i < data.userActivity.length; i++) {
    const row = activityStartRow + i
    const isEven = i % 2 === 0
    const style = isEven ? alternateRowStyle : normalBorderStyle
    for (let col = 1; col <= 3; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })
      applyCellStyle(mainSheet, cellRef, style)
    }
  }

  // Caixas amarelas para texto explicativo
  const yellowBoxRows = [12, 13] // Linhas do relatório de status
  const conclusionRows = [28, 29, 30] // Linhas das conclusões

  yellowBoxRows.concat(conclusionRows).forEach(row => {
    for (let col = 1; col <= 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })
      applyCellStyle(mainSheet, cellRef, yellowBoxStyle)
    }
  })

  // Configurar largura das colunas
  mainSheet['!cols'] = [
    { wch: 25 }, // Coluna A
    { wch: 15 }, // Coluna B
    { wch: 18 }, // Coluna C
    { wch: 12 }, // Coluna D
    { wch: 20 }  // Coluna E
  ]

  // Mesclar células para o título
  mainSheet['!merges'] = [
    { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } }, // Título principal
    { s: { r: 6, c: 0 }, e: { r: 6, c: 4 } }, // RESUMO DO PROJETO
    { s: { r: 10, c: 0 }, e: { r: 10, c: 4 } }, // RELATÓRIO DO STATUS
    { s: { r: 14, c: 0 }, e: { r: 14, c: 4 } }, // VISÃO GERAL DO PROJETO
    { s: { r: 22, c: 0 }, e: { r: 22, c: 4 } }, // ATIVIDADE DO USUÁRIO
    { s: { r: 26, c: 0 }, e: { r: 26, c: 4 } }, // CONCLUSÕES
  ]

  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Relatório Completo')

  // ====== PLANILHAS SEPARADAS PARA DADOS ESPECÍFICOS ======

  // Planilha de métricas detalhadas
  const metricsData = [
    ['MÉTRICAS DETALHADAS', '', ''],
    ['Métrica', 'Valor', 'Status'],
    ['Vagas Criadas', metrics.vagasCriadas, 'Concluído'],
    ['Candidatos Cadastrados', metrics.candidatosCadastrados, 'Concluído'],
    ['Contatos Realizados', metrics.contatosRealizados, 'Concluído'],
    ['Matches Gerados', metrics.matches, 'Concluído'],
    ['Ações Pendentes', metrics.acoesPendentes, 'Em andamento'],
  ]
  const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData)

  // Aplicar estilos à planilha de métricas
  applyCellStyle(metricsSheet, 'A1', sectionStyle)
  for (let col = 1; col <= 3; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: col - 1 })
    applyCellStyle(metricsSheet, cellRef, headerStyle)
  }

  metricsSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métricas')

  // Planilha de atividade do usuário detalhada
  const userActivityData = [
    ['ATIVIDADE DO USUÁRIO DETALHADA', '', ''],
    ['Dia', 'Logins', 'Ações'],
    ...data.userActivity.map((item) => [item.name, item.logins, item.acoes]),
  ]
  const userActivitySheet = XLSX.utils.aoa_to_sheet(userActivityData)

  // Aplicar estilos à planilha de atividade
  applyCellStyle(userActivitySheet, 'A1', sectionStyle)
  for (let col = 1; col <= 3; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: col - 1 })
    applyCellStyle(userActivitySheet, cellRef, headerStyle)
  }

  userActivitySheet['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(workbook, userActivitySheet, 'Atividade do Usuário')

  XLSX.writeFile(workbook, `relatorio-status-${tenantSlug}-${period}.xlsx`)
}