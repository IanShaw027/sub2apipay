'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/locale';

interface RefundDialogProps {
  orderId: string;
  amount: number;
  requestedAmount?: number | null;
  onConfirm: (amount: number, reason: string, force: boolean) => Promise<void>;
  onCancel: () => void;
  warning?: string;
  requireForce?: boolean;
  dark?: boolean;
  locale?: Locale;
}

export default function RefundDialog({
  orderId,
  amount,
  requestedAmount,
  onConfirm,
  onCancel,
  warning,
  requireForce,
  dark = false,
  locale = 'zh',
}: RefundDialogProps) {
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState((requestedAmount ?? amount).toFixed(2));
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);

  const currency = locale === 'en' ? '$' : '¥';
  const text =
    locale === 'en'
      ? {
          title: 'Confirm Refund',
          orderId: 'Order ID',
          maxAmount: 'Order Amount',
          refundAmount: 'Refund Amount',
          refundAmountPlaceholder: 'Enter refund amount',
          reason: 'Refund Reason',
          reasonPlaceholder: 'Enter refund reason (optional)',
          amountInvalid: 'Refund amount must be greater than 0',
          amountExceeded: 'Refund amount cannot exceed order amount',
          forceRefund: 'Force refund (balance may become negative)',
          cancel: 'Cancel',
          confirm: 'Confirm Refund',
          processing: 'Processing...',
        }
      : {
          title: '确认退款',
          orderId: '订单号',
          maxAmount: '订单金额',
          refundAmount: '退款金额',
          refundAmountPlaceholder: '请输入退款金额',
          reason: '退款原因',
          reasonPlaceholder: '请输入退款原因（可选）',
          amountInvalid: '退款金额必须大于 0',
          amountExceeded: '退款金额不能超过订单金额',
          forceRefund: '强制退款（余额可能扣为负数）',
          cancel: '取消',
          confirm: '确认退款',
          processing: '处理中...',
        };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const parsedRefundAmount = Number(refundAmount);
  const amountError = !Number.isFinite(parsedRefundAmount) || parsedRefundAmount <= 0
    ? text.amountInvalid
    : parsedRefundAmount > amount
      ? text.amountExceeded
      : '';

  const handleConfirm = async () => {
    if (amountError) return;
    setLoading(true);
    try {
      await onConfirm(parsedRefundAmount, reason, force);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={['w-full max-w-md rounded-xl p-6 shadow-xl', dark ? 'bg-slate-900' : 'bg-white'].join(' ')}>
        <h3 className={['text-lg font-bold', dark ? 'text-slate-100' : 'text-gray-900'].join(' ')}>{text.title}</h3>

        <div className="mt-4 space-y-3">
          <div className={['rounded-lg p-3', dark ? 'bg-slate-800' : 'bg-gray-50'].join(' ')}>
            <div className={['text-sm', dark ? 'text-slate-400' : 'text-gray-500'].join(' ')}>{text.orderId}</div>
            <div className={['text-sm font-mono', dark ? 'text-slate-200' : 'text-gray-900'].join(' ')}>{orderId}</div>
          </div>

          <div className={['rounded-lg p-3', dark ? 'bg-slate-800' : 'bg-gray-50'].join(' ')}>
            <div className={['text-sm', dark ? 'text-slate-400' : 'text-gray-500'].join(' ')}>{text.maxAmount}</div>
            <div className={['text-lg font-bold', dark ? 'text-red-400' : 'text-red-600'].join(' ')}>
              {currency}
              {amount.toFixed(2)}
            </div>
          </div>

          {warning && (
            <div className={['rounded-lg p-3 text-sm', dark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'].join(' ')}>
              {warning}
            </div>
          )}

          <div>
            <label className={['mb-1 block text-sm font-medium', dark ? 'text-slate-300' : 'text-gray-700'].join(' ')}>
              {text.refundAmount}
            </label>
            <input
              type="number"
              min="0.01"
              max={amount.toFixed(2)}
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={text.refundAmountPlaceholder}
              className={['w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none', dark ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-300 bg-white text-gray-900'].join(' ')}
            />
            {amountError && <div className={['mt-1 text-xs', dark ? 'text-red-400' : 'text-red-600'].join(' ')}>{amountError}</div>}
          </div>

          <div>
            <label className={['mb-1 block text-sm font-medium', dark ? 'text-slate-300' : 'text-gray-700'].join(' ')}>
              {text.reason}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={text.reasonPlaceholder}
              className={['w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none', dark ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-300 bg-white text-gray-900'].join(' ')}
            />
          </div>

          {requireForce && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className={['rounded', dark ? 'border-slate-600' : 'border-gray-300'].join(' ')}
              />
              <span className={dark ? 'text-red-400' : 'text-red-600'}>{text.forceRefund}</span>
            </label>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className={['flex-1 rounded-lg border py-2 text-sm', dark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'].join(' ')}
          >
            {text.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !!amountError || (requireForce && !force)}
            className={['flex-1 rounded-lg py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed', dark ? 'bg-red-600/90 disabled:bg-slate-700 disabled:text-slate-500' : 'bg-red-600 disabled:bg-gray-300 disabled:text-gray-400'].join(' ')}
          >
            {loading ? text.processing : text.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
