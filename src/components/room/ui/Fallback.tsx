"use client";

import { Component, useEffect, useSyncExternalStore } from "react";
import type { ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import { ROOM_INTRO } from "@/lib/room-content";
import { useRoom, useRoomStore } from "../store";

const READY_TIMEOUT_MS = 8000;

let webglSupport: boolean | null = null;

/** One-time WebGL probe on a scratch canvas (the context is released right away). */
function detectWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    // QA hook: `?webgl=0` forces the fallback.
    if (new URLSearchParams(window.location.search).get("webgl") === "0") {
      webglSupport = false;
      return webglSupport;
    }
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    webglSupport = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const noSubscribe = () => () => {};

/**
 * `null` on the server and during hydration, then whether WebGL is available.
 * The canvas only mounts once this is `true`.
 */
export function useWebGLSupport(): boolean | null {
  return useSyncExternalStore(noSubscribe, detectWebGL, () => null);
}

/**
 * Sets the store's `failed` flag: hard when WebGL is missing or the canvas
 * crashed, soft when the first frame has not rendered within ~8s (a late
 * `ready` clears a soft failure, which matters for slow dev compiles).
 */
export function useRoomBoot(webgl: boolean | null, crashed: boolean) {
  const store = useRoomStore();

  useEffect(() => {
    if (webgl === false || crashed) store.setState({ failed: true });
  }, [webgl, crashed, store]);

  useEffect(() => {
    if (webgl !== true || crashed) return;
    let timer = 0;
    const check = () => {
      if (store.getState().ready) return;
      // A background tab pauses the render loop; wait until it is visible.
      if (document.hidden) {
        timer = window.setTimeout(check, 1000);
        return;
      }
      store.setState({ failed: true });
    };
    timer = window.setTimeout(check, READY_TIMEOUT_MS);
    const unsubscribe = store.subscribe(() => {
      const s = store.getState();
      if (s.ready && s.failed) store.setState({ failed: false });
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [webgl, crashed, store]);
}

/** Catches render errors in the 3D tree so the DOM panels keep working. */
export class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[room] The 3D scene crashed; showing the fallback.", error, info.componentStack);
    this.props.onError();
  }

  render() {
    return this.state.crashed ? null : this.props.children;
  }
}

/** Friendly card shown when the 3D room is unavailable. */
export function Fallback() {
  const failed = useRoom((s) => s.failed);
  if (!failed) return null;
  return (
    <div className="room-fallback" role="note">
      <p className="room-fallback-title">The 3D room could not load.</p>
      <p className="room-fallback-text">
        Here is{" "}
        <Link href={ROOM_INTRO.plainHref}>the plain version</Link>. The buttons below still open
        every section.
      </p>
    </div>
  );
}
