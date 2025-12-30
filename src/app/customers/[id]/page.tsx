import { requireAuth } from "@/lib/auth/auth";
import { getCustomerAction, getCustomerProjectsAction, getCustomerHistoryAction } from "../actions";
import { notFound } from "next/navigation";
import CustomerDetailClient from "./components/CustomerDetailClient";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  await requireAuth();
  
  const { id } = await params;
  const customerResult = await getCustomerAction(id);
  const projectsResult = await getCustomerProjectsAction(id);
  const historyResult = await getCustomerHistoryAction(id);

  if (customerResult.error || !customerResult.customer) {
    notFound();
  }

  const customer = customerResult.customer;
  const projects = projectsResult.projects || [];
  const history = historyResult.history || [];

  return (
    <CustomerDetailClient
      customerId={id}
      customer={customer}
      projects={projects}
      history={history}
    />
  );
}

