
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Loan, Client } from '@/types/loan';
import { Installment } from '@/types/installment';

export const generateReport = (clients: Client[], loans: Loan[], installments: Installment[], stats: any) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Relatório de Clientes e Empréstimos', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    
    // Prepare data for the table
    const reportData = clients.map(client => {
      const clientLoans = loans.filter(loan => loan.clientId === client.id);
      const clientInstallments = installments.filter(inst => 
        clientLoans.some(loan => loan.id === inst.loanId)
      );
      
      return clientLoans.map(loan => {
        const loanInstallments = clientInstallments.filter(inst => inst.loanId === loan.id);
        const paidInstallments = loanInstallments.filter(inst => inst.status === "paid").length;
        const remainingInstallments = loan.installments - paidInstallments;

        return [
          client.fullName,
          `R$ ${loan.amount.toLocaleString('pt-BR')}`,
          `${loan.interestRate}%`,
          loan.installments.toString(),
          paidInstallments.toString(),
          remainingInstallments.toString(),
          `R$ ${loan.totalAmount.toLocaleString('pt-BR')}`,
          new Date(loan.loanDate).toLocaleDateString('pt-BR'),
          loan.status === "active" ? "Ativo" : "Finalizado"
        ];
      });
    }).flat();

    // Table headers
    const headers = [
      'Cliente',
      'Valor Empréstimo',
      'Taxa Juros',
      'Total Parcelas',
      'Parcelas Pagas',
      'Parcelas Restantes',
      'Valor Total',
      'Data Empréstimo',
      'Status'
    ];

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: reportData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      }
    });

    // Statistics section
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFontSize(14);
    doc.text('Resumo Estatístico', 20, finalY);
    
    doc.setFontSize(10);
    doc.text(`Total Emprestado: R$ ${stats.totalLoaned.toLocaleString('pt-BR')}`, 20, finalY + 10);
    doc.text(`Total em Juros: R$ ${stats.totalReceived.toLocaleString('pt-BR')}`, 20, finalY + 20);
    doc.text(`Clientes Ativos: ${stats.activeClients}`, 20, finalY + 30);
    doc.text(`Empréstimos Ativos: ${stats.activeLoans}`, 20, finalY + 40);
    doc.text(`Pagamentos Atrasados: ${stats.overduePayments}`, 20, finalY + 50);

    // Save the PDF
    doc.save(`relatorio-clientes-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};
