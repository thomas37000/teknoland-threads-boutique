import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: t("newsletter.error"),
        description: t("newsletter.errorEmailRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email },
      });

      if (error) throw error;

      setIsSuccess(true);
      setEmail("");
      toast({
        title: t("newsletter.successTitle"),
        description: t("newsletter.successDescription"),
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: t("newsletter.error"),
        description: error.message || t("newsletter.errorGeneric"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {t("newsletter.title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("newsletter.description")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isSuccess}
                  className="h-12"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || isSuccess}
                className="h-12 px-8"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t("newsletter.subscribing")}
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {t("newsletter.subscribed")}
                  </span>
                ) : (
                  t("newsletter.subscribe")
                )}
              </Button>
            </div>

            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{t("newsletter.gdprNotice")}</p>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              {t("newsletter.benefits")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
