import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentProps } from "react";

type LinkComponentProps = ComponentProps<typeof Link>;

/**
 * AppLink — thin wrapper over TanStack's <Link> that accepts a plain string
 * path. Navigation targets live in a declarative config (nav-config.ts) that
 * is data, not literal route types; this keeps the config readable while
 * still using the client router (preloading, active state, no full reload).
 */
export function AppLink({ to, ...props }: { to: string } & Omit<LinkComponentProps, "to">) {
  const linkProps = { to, ...props } as LinkComponentProps;
  return <Link {...linkProps} />;
}


/** True when the current pathname is `path` or a child of it. */
export function useIsActivePath(path: string) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === path || pathname.startsWith(`${path}/`);
}
