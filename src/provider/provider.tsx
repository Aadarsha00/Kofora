"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


interface IProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();
const Provider: React.FC<IProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
     
        <>{children}</>
     
    </QueryClientProvider>
  );
};

export default Provider;
