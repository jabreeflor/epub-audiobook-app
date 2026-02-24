/**
 * Type declarations for epubjs
 * Extends the default types with additional properties we use
 */

declare module 'epubjs' {
  export interface NavItem {
    id: string;
    href: string;
    label: string;
    subitems?: NavItem[];
  }

  export interface SpineItem {
    href: string;
    index: number;
    cfiBase: string;
    linear: boolean;
    properties: string[];
    load: (request: RequestInit) => Promise<Document>;
  }

  export interface Spine {
    items: SpineItem[];
    get: (target: string | number) => SpineItem | null;
  }

  export interface Navigation {
    toc: NavItem[];
    landmarks: NavItem[];
  }

  export interface Metadata {
    title: string;
    creator: string;
    description: string;
    publisher: string;
    language: string;
    rights: string;
    identifier: string;
  }

  export interface Book {
    ready: Promise<void>;
    loaded: {
      metadata: Promise<Metadata>;
      navigation: Promise<Navigation>;
      spine: Promise<Spine>;
    };
    spine: Spine;
    coverUrl: () => Promise<string | null>;
    load: (path: string) => Promise<unknown>;
    destroy: () => void;
  }

  export default function ePub(input: string | ArrayBuffer): Book;
}
