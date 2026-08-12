export {};

declare global {
  namespace google {
    namespace accounts {
      namespace id {
        function initialize(config: {
          client_id: string;
          callback: (response: { credential?: string }) => void;
        }): void;
        function renderButton(
          parent: HTMLElement,
          options: {
            type?: "standard" | "icon";
            theme?: "outline" | "filled_blue" | "filled_black";
            size?: "large" | "medium" | "small";
            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
            shape?: "rectangular" | "pill" | "circle" | "square";
            logo_alignment?: "left" | "center";
            width?: number;
          }
        ): void;
      }
    }
  }

  interface Window {
    google?: typeof google;
  }
}
