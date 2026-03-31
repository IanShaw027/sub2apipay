import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth';
import { getEnv } from '@/lib/config';
import { initPaymentProviders, paymentRegistry } from '@/lib/payment';

// 所有支持的服务商及其渠道定义
const ALL_PROVIDERS = [
  { key: 'easypay', types: ['alipay', 'wxpay'] },
  { key: 'alipay', types: ['alipay_direct'] },
  { key: 'wxpay', types: ['wxpay_direct'] },
  { key: 'stripe', types: ['stripe'] },
];

export async function GET(request: NextRequest) {
  if (!(await verifyAdminToken(request))) return unauthorizedResponse(request);

  try {
    const env = getEnv();
    initPaymentProviders();
    const supportedTypes = paymentRegistry.getSupportedTypes();
    const configuredProviders = env.PAYMENT_PROVIDERS;

    // 构建服务商信息（包含是否已配置）
    const providers = ALL_PROVIDERS.map((p) => ({
      key: p.key,
      configured: configuredProviders.includes(p.key),
      types: p.types,
    }));

    return NextResponse.json({
      availablePaymentTypes: supportedTypes,
      providers,
      defaults: {
        ENABLED_PAYMENT_TYPES: supportedTypes.join(','),
        RECHARGE_MIN_AMOUNT: String(env.MIN_RECHARGE_AMOUNT),
        RECHARGE_MAX_AMOUNT: String(env.MAX_RECHARGE_AMOUNT),
        DAILY_RECHARGE_LIMIT: String(env.MAX_DAILY_RECHARGE_AMOUNT),
        ORDER_TIMEOUT_MINUTES: String(env.ORDER_TIMEOUT_MINUTES),
      },
    });
  } catch (error) {
    console.error('Failed to get env defaults:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get env defaults' }, { status: 500 });
  }
}
