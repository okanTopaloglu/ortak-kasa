'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { reports } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const CHART_COLORS = ['#10B981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

export default function CompanyDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;
  const [data, setData] = useState<{
    summary: { totalIncome: number; totalExpense: number; netProfit: number; cashInHand: number };
    profitByBranch: { branchName: string; profit: number }[];
    profitByPartner: { userName: string; profit: number }[];
  } | null>(null);
  const [monthlyData, setMonthlyData] = useState<{ month: number; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    if (!companyId) return;
    setError(null);
    setLoading(true);
    reports
      .dashboardFull(companyId)
      .then((res) => {
        const { dashboard, monthly } = res.data;
        setData(dashboard);
        setMonthlyData(
          monthly.monthly.map((m: { month: number; amount: number }) => ({
            name: MONTHS[m.month - 1],
            amount: m.amount,
          }))
        );
      })
      .catch(() => {
        setError('API\'ye bağlanılamıyor. API\'nin çalıştığından emin olun (npm run dev).');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  if (loading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg border bg-card" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[380px] rounded-lg border bg-card" />
          <div className="h-[380px] rounded-lg border bg-card" />
        </div>
        <div className="h-[380px] rounded-lg border bg-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">← Geri</Button>
        </Link>
        <div className="p-6 rounded-lg border border-red-500/50 bg-red-500/10 text-red-500">
          <p className="font-medium">{error}</p>
          <Button className="mt-4" onClick={loadData}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Geri</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Gelir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(data.summary.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Gider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(data.summary.totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Kar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data.summary.netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kasadaki Para
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data.summary.cashInHand)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Aylık Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Gelir']}
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader>
            <CardTitle>İş Koluna Göre Kar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.profitByBranch}
                    dataKey="profit"
                    nameKey="branchName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.branchName}
                  >
                    {data.profitByBranch.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Kar']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Ortaklara Göre Kar Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.profitByPartner}
                  dataKey="profit"
                  nameKey="userName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.userName}
                >
                  {data.profitByPartner.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Pay']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href={`/dashboard/companies/${companyId}/branches`}>
          <Button>İş Kolları</Button>
        </Link>
        <Link href={`/dashboard/companies/${companyId}/members`}>
          <Button variant="outline">Üyeler</Button>
        </Link>
      </div>
    </div>
  );
}
