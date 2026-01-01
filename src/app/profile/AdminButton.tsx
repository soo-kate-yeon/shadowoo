"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function AdminButton({ userId }: { userId: string }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (data && data.role === "admin") {
        setIsAdmin(true);
      }
    };
    checkRole();
  }, [userId, supabase]);

  if (!isAdmin) return null;

  return (
    <section className="bg-secondary-50 rounded-2xl p-6 border border-secondary-300/50">
      <h2 className="text-2xl font-semibold text-primary-900 mb-4">
        관리자 메뉴
      </h2>
      <Button
        onClick={() => router.push("/admin")}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors"
      >
        Admin Dashboard 접속
      </Button>
    </section>
  );
}
