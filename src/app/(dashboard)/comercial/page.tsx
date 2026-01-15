import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ComercialPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Comercial</h1>
        <p className="text-muted-foreground">
          Seção em desenvolvimento
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
          <CardDescription>
            Esta seção estará disponível em breve com recursos de gestão comercial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aguarde atualizações futuras para acessar funcionalidades como:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>- Visão geral de vendas e KPIs</li>
            <li>- Relatórios de performance</li>
            <li>- Análise de conversão</li>
            <li>- Metas e objetivos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
