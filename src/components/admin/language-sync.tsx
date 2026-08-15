"use client"; import { useEffect } from "react";
export function AdminLanguageSync(){useEffect(()=>{document.documentElement.lang="en";return()=>{document.documentElement.lang="ka"}},[]);return <script dangerouslySetInnerHTML={{__html:'document.documentElement.lang="en"'}}/>}
