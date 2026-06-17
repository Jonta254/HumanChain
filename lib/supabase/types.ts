export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      hc_users: {
        Row: {
          wallet: string;
          username: string;
          points: number;
          streak: number;
          tier: string;
          joined_at: string;
          last_seen_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hc_users"]["Row"], "joined_at"> & {
          joined_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hc_users"]["Row"]>;
      };
      hc_ask_threads: {
        Row: {
          id: string;
          question: string;
          author_wallet: string;
          author_username: string;
          created_at: string;
          answer_count: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["hc_ask_threads"]["Row"],
          "created_at" | "answer_count"
        > & { created_at?: string; answer_count?: number };
        Update: Partial<Database["public"]["Tables"]["hc_ask_threads"]["Row"]>;
      };
      hc_ask_answers: {
        Row: {
          id: string;
          thread_id: string;
          body: string;
          author_wallet: string;
          author_username: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hc_ask_answers"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hc_ask_answers"]["Row"]>;
      };
      hc_moments: {
        Row: {
          id: string;
          text: string;
          image_url: string | null;
          author_wallet: string;
          author_username: string;
          emoji: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hc_moments"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hc_moments"]["Row"]>;
      };
      hc_marketplace: {
        Row: {
          id: string;
          title: string;
          price: number;
          condition: string;
          category: string;
          description: string | null;
          seller_wallet: string;
          seller_username: string;
          location: string | null;
          status: "active" | "sold";
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["hc_marketplace"]["Row"],
          "created_at" | "status"
        > & { created_at?: string; status?: "active" | "sold" };
        Update: Partial<Database["public"]["Tables"]["hc_marketplace"]["Row"]>;
      };
      hc_hp_ledger: {
        Row: {
          id: string;
          wallet: string;
          amount: number;
          reason: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hc_hp_ledger"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}
