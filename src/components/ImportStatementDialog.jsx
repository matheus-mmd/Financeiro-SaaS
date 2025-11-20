'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * ImportStatementDialog - Dialog para importar extratos bancários em OFX
 * @param {boolean} open - Estado de abertura do dialog
 * @param {Function} onOpenChange - Callback para mudar estado de abertura
 * @param {Function} onImport - Callback com transações importadas
 */
export default function ImportStatementDialog({ open, onOpenChange, onImport }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.ofx')) {
        setError('Por favor, selecione um arquivo OFX');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setParsedTransactions([]);
    }
  };

  const parseOFX = (text) => {
    console.log('Iniciando parsing OFX...');
    console.log('Tamanho do arquivo:', text.length);

    const transactions = [];

    try {
      // Remover BOM e caracteres especiais
      const cleanText = text.replace(/^\uFEFF/, '').trim();

      // Extrair todas as transações <STMTTRN>...</STMTTRN>
      const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
      const matches = cleanText.matchAll(stmtTrnRegex);

      let count = 0;
      for (const match of matches) {
        count++;
        const transactionBlock = match[1];
        console.log(`\nTransação ${count}:`);
        console.log(transactionBlock.substring(0, 200));

        try {
          // Extrair campos da transação
          const trnType = extractTag(transactionBlock, 'TRNTYPE');
          const dtPosted = extractTag(transactionBlock, 'DTPOSTED');
          const trnAmt = extractTag(transactionBlock, 'TRNAMT');
          const memo = extractTag(transactionBlock, 'MEMO') || extractTag(transactionBlock, 'NAME') || `Transação ${count}`;

          console.log('Campos extraídos:', { trnType, dtPosted, trnAmt, memo });

          if (!dtPosted || !trnAmt) {
            console.warn('Transação sem data ou valor, pulando...');
            continue;
          }

          // Converter data OFX (YYYYMMDD) para formato ISO (YYYY-MM-DD)
          const date = parseOFXDate(dtPosted);
          if (!date) {
            console.warn('Data inválida:', dtPosted);
            continue;
          }

          // Converter valor
          const amount = parseFloat(trnAmt);
          if (isNaN(amount)) {
            console.warn('Valor inválido:', trnAmt);
            continue;
          }

          // Determinar tipo baseado no TRNTYPE ou valor
          let type = 'debit';
          if (trnType) {
            const trnTypeLower = trnType.toLowerCase();
            if (trnTypeLower.includes('credit') || trnTypeLower.includes('dep')) {
              type = 'credit';
            } else if (trnTypeLower.includes('debit') || trnTypeLower.includes('payment')) {
              type = 'debit';
            }
          } else {
            // Se não tem TRNTYPE, usa o sinal do valor
            type = amount > 0 ? 'credit' : 'debit';
          }

          const transaction = {
            date: date,
            description: memo.trim(),
            amount: Math.abs(amount),
            type: type,
          };

          console.log('Transação parseada:', transaction);
          transactions.push(transaction);

        } catch (err) {
          console.error(`Erro ao processar transação ${count}:`, err);
        }
      }

      console.log(`\nTotal de transações encontradas: ${transactions.length}`);

    } catch (err) {
      console.error('Erro ao parsear OFX:', err);
      throw err;
    }

    return transactions;
  };

  // Extrai o valor de uma tag OFX
  const extractTag = (text, tagName) => {
    // Tentar formato XML: <TAG>valor</TAG>
    const xmlRegex = new RegExp(`<${tagName}>([^<]*)<\/${tagName}>`, 'i');
    const xmlMatch = text.match(xmlRegex);
    if (xmlMatch) {
      return xmlMatch[1].trim();
    }

    // Tentar formato SGML: <TAG>valor
    const sgmlRegex = new RegExp(`<${tagName}>([^<\n\r]+)`, 'i');
    const sgmlMatch = text.match(sgmlRegex);
    if (sgmlMatch) {
      return sgmlMatch[1].trim();
    }

    return null;
  };

  // Converte data OFX (YYYYMMDD ou YYYYMMDDHHMMSS) para formato ISO
  const parseOFXDate = (dateStr) => {
    if (!dateStr) return null;

    // Remover qualquer caractere que não seja número
    const cleaned = dateStr.replace(/[^0-9]/g, '');

    if (cleaned.length < 8) {
      console.warn('Data OFX muito curta:', dateStr);
      return null;
    }

    const year = cleaned.substring(0, 4);
    const month = cleaned.substring(4, 6);
    const day = cleaned.substring(6, 8);

    // Validar data
    const dateObj = new Date(year, parseInt(month) - 1, day);
    if (isNaN(dateObj.getTime())) {
      console.warn('Data inválida após parsing:', year, month, day);
      return null;
    }

    return `${year}-${month}-${day}`;
  };

  const handleParse = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const text = await file.text();
      const transactions = parseOFX(text);

      if (transactions.length === 0) {
        setError('Nenhuma transação válida encontrada no arquivo OFX');
        setParsedTransactions([]);
      } else {
        setParsedTransactions(transactions);
      }
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError(`Erro ao processar arquivo: ${err.message}`);
      setParsedTransactions([]);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = () => {
    if (parsedTransactions.length > 0) {
      onImport(parsedTransactions);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedTransactions([]);
    setError(null);
    onOpenChange(false);
  };

  const getTypeInfo = (type) => {
    const types = {
      credit: { label: 'Crédito', color: 'bg-green-500' },
      debit: { label: 'Débito', color: 'bg-red-500' },
      investment: { label: 'Aporte', color: 'bg-blue-500' },
    };
    return types[type] || types.debit;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
          <DialogDescription>
            Importe transações de um arquivo OFX do seu banco
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações sobre OFX */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Como obter o arquivo OFX:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Acesse o site ou app do seu banco</li>
                  <li>Vá em "Extratos" ou "Movimentações"</li>
                  <li>Escolha a opção "Exportar" ou "Download"</li>
                  <li>Selecione o formato OFX (ou Money/Microsoft Money)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo OFX</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".ofx"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleParse}
                disabled={!file || parsing}
              >
                <Upload className="w-4 h-4 mr-2" />
                {parsing ? 'Processando...' : 'Processar'}
              </Button>
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{file.name}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              <strong>Dica:</strong> Abra o Console do navegador (F12) para ver detalhes do processamento
            </p>
          </div>

          {/* Mensagens de erro */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview das transações */}
          {parsedTransactions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Transações encontradas ({parsedTransactions.length})
                </Label>
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Pronto para importar
                </Badge>
              </div>

              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Data
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Descrição
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Tipo
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedTransactions.map((transaction, index) => {
                      const typeInfo = getTypeInfo(transaction.type);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-3 py-2">{transaction.description}</td>
                          <td className="px-3 py-2">
                            <Badge variant="default" className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            R$ {transaction.amount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Resumo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Antes de importar:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Verifique se as transações estão corretas</li>
                      <li>Transações duplicadas não serão verificadas automaticamente</li>
                      <li>Você poderá editar ou excluir as transações após a importação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={parsedTransactions.length === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Importar {parsedTransactions.length > 0 && `(${parsedTransactions.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}