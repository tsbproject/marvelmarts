"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import {
  CheckCircle2,
  Facebook,
  Link2,
  Loader2,
  ShieldCheck,
  Unlink,
} from "lucide-react";

type LinkedAccount = {
  id: string;
  provider: string;
  type: string;
};

const PROVIDERS = {
  google: {
    name: "Google",
    description:
      "Use your Google account for faster sign-in.",
  },
  facebook: {
    name: "Facebook",
    description:
      "Use your Facebook account for faster sign-in.",
  },
} as const;

export default function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<
    LinkedAccount[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] =
    useState<string | null>(null);
  const [disconnecting, setDisconnecting] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadAccounts() {
    try {
      setError("");

      const response = await fetch(
        "/api/auth/accounts",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load connected accounts."
        );
      }

      setAccounts(data.accounts ?? []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load connected accounts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  function isConnected(provider: string) {
    return accounts.some(
      (account) =>
        account.provider === provider
    );
  }

  async function handleConnect(
    provider: "google" | "facebook"
  ) {
    setConnecting(provider);
    setError("");

    await signIn(provider, {
      callbackUrl:
        "/account/customer/profile-settings?linked=" +
        provider,
    });
  }

  async function handleDisconnect(
    provider: "google" | "facebook"
  ) {
    const confirmed = window.confirm(
      `Disconnect your ${PROVIDERS[provider].name} account from MarvelMarts?`
    );

    if (!confirmed) {
      return;
    }

    setDisconnecting(provider);
    setError("");

    try {
      const response = await fetch(
        `/api/auth/accounts/${provider}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to disconnect account."
        );
      }

      await loadAccounts();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to disconnect account."
      );
    } finally {
      setDisconnecting(null);
    }
  }

  return (
    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Link2
                  size={20}
                  className="text-brand-primary"
                />
              </div>

              <div>
                <h3 className="text-accent-navy font-black text-lg uppercase tracking-tight">
                  Connected Accounts
                </h3>

                <p className="text-neutral-gray text-[11px] font-bold mt-1">
                  Manage the social accounts connected
                  to your MarvelMarts account.
                </p>
              </div>
            </div>
          </div>

          <ShieldCheck
            size={20}
            className="text-brand-primary shrink-0"
          />
        </div>
      </div>

      <div className="p-8 space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2
              size={22}
              className="animate-spin text-brand-primary"
            />
          </div>
        ) : (
          <>
            {(
              Object.keys(PROVIDERS) as Array<
                keyof typeof PROVIDERS
              >
            ).map((provider) => {
              const config =
                PROVIDERS[provider];

              const connected =
                isConnected(provider);

              const busy =
                connecting === provider ||
                disconnecting === provider;

              return (
                <div
                  key={provider}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-3xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                      {provider === "facebook" ? (
                        <Facebook
                          size={21}
                          className="text-[#1877F2]"
                        />
                      ) : (
                        <span className="text-lg font-black text-accent-navy">
                          G
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-accent-navy font-black text-sm">
                          {config.name}
                        </h4>

                        {connected && (
                          <CheckCircle2
                            size={15}
                            className="text-green-600"
                          />
                        )}
                      </div>

                      <p className="text-neutral-gray text-[10px] font-bold mt-1">
                        {connected
                          ? "Connected to your MarvelMarts account."
                          : config.description}
                      </p>
                    </div>
                  </div>

                  {connected ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleDisconnect(
                          provider
                        )
                      }
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-red-100 bg-white text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {disconnecting ===
                      provider ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Unlink size={14} />
                      )}

                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleConnect(
                          provider
                        )
                      }
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary text-accent-navy font-black text-[10px] uppercase tracking-widest hover:bg-accent-navy hover:text-white transition-all shadow-lg shadow-brand-primary/10 disabled:opacity-50"
                    >
                      {connecting === provider ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Link2 size={14} />
                      )}

                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}