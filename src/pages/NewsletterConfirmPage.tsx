import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const NewsletterConfirmPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const confirmSubscription = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("newsletter-confirm", {
          body: { token },
        });

        if (error) throw error;

        if (data?.email) {
          setEmail(data.email);
        }
        
        setStatus("success");
      } catch (error) {
        console.error("Newsletter confirmation error:", error);
        setStatus("error");
      }
    };

    confirmSubscription();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 md:p-12 border text-center">
        {status === "loading" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-3">
              {t("newsletterConfirm.loading")}
            </h1>
            <p className="text-muted-foreground">
              {t("newsletterConfirm.loadingDescription")}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-green-600 dark:text-green-400">
              {t("newsletterConfirm.success")}
            </h1>
            <p className="text-muted-foreground mb-2">
              {t("newsletterConfirm.successDescription")}
            </p>
            {email && (
              <p className="text-sm font-medium mb-6">{email}</p>
            )}
            <div className="space-y-3">
              <Link to="/shop">
                <Button className="w-full">
                  {t("newsletterConfirm.shopNow")}
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  {t("newsletterConfirm.backHome")}
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-red-600 dark:text-red-400">
              {t("newsletterConfirm.error")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("newsletterConfirm.errorDescription")}
            </p>
            <div className="space-y-3">
              <Link to="/">
                <Button variant="outline" className="w-full">
                  {t("newsletterConfirm.backHome")}
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterConfirmPage;
