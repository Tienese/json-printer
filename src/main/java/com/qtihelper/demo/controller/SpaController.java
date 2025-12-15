package com.qtihelper.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to support client-side routing for the React SPA.
 * Forwards all non-API routes to index.html so React Router can handle them.
 *
 * This is necessary because in a SPA, the frontend routing is handled by React Router,
 * but when users navigate directly to a route (e.g., /dashboard) or refresh the page,
 * the browser makes a request to the server. Without this controller, the server
 * would return a 404 for routes that don't have server-side handlers.
 */
@Controller
public class SpaController {

	/**
	 * Forward all React routes to index.html.
	 *
	 * Excludes:
	 * - /api/** (REST API endpoints)
	 * - /static/** (static resources like CSS, JS, images)
	 * - /assets/** (Vite build assets)
	 *
	 * This ensures that React Router can handle the routing on the client side.
	 */
	@RequestMapping(value = {
		"/",
		"/dashboard",
		"/print-report",
		"/print-report/**",
		"/quiz/**",
		"/worksheet",
		"/worksheet/**"
	})
	public String forward() {
		return "forward:/index.html";
	}
}
