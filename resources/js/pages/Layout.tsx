 from "next";
import React from 'react';
import "./globals.css";
import { Providers  from "./providers";




  title: "Telemedicina Venezuela",
  description: "Plataforma integral de telemedicina para Venezuela",
;

export default function RootLayout({
  children,
: Readonly<{
  children: React.ReactNode;
>) {
  return (
    
      <body>
        <Providers>{children</Providers>
      </body>
    
  );


