import CyberLayout from "@/components/layout/CyberLayout";
import ChatInterface from "@/components/cyber/ChatInterface";
import PageTitle from "@/components/utils/PageTitle";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function CyberAgentPage() {
  return (
    <CyberLayout>
      <PageTitle title="AGENT IA" />
      <div className="mb-6 px-4 sm:px-6">
        <Link href="/cyber" className="inline-flex items-center text-[#46cada] hover:text-blue-600 transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour à I AM CYBER
        </Link>
      </div>
      <ChatInterface />
    </CyberLayout>
  );
}