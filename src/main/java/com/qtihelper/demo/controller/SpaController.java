package com.qtihelper.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Controller to support client-side routing for the React SPA.
 * Forwards all non-API routes to index.html so the React app can handle them.
 *
 * The React app uses hash-based navigation (e.g., /#dashboard, /#worksheet),
 * so the browser only requests "/" from the server. The hash determines which
 * page the React app renders.
 *
 * The additional routes are kept for backward compatibility and direct URL
 * access. If a user types /dashboard directly, they'll be forwarded to
 * index.html and the React app will show the landing page.
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
	@RequestMapping(value = { "/" })
	public String forward() {
		return "forward:/index.html";
	}

	/**
	 * Redirect Worksheet path to the hash-based route.
	 */
	@GetMapping({ "/worksheet", "/worksheet/**" })
	public RedirectView redirectWorksheet() {
		return new RedirectView("/#worksheet");
	}

	/**
	 * Redirect Quiz paths to their respective hash-based routes.
	 */
	@GetMapping("/quiz/editor")
	public RedirectView redirectQuizEditor() {
		return new RedirectView("/#quiz/editor");
	}

	@GetMapping("/quiz/success")
	public RedirectView redirectQuizSuccess() {
		return new RedirectView("/#quiz/success");
	}

	@GetMapping("/quiz-import")
	public RedirectView redirectQuizImport() {
		return new RedirectView("/#quiz-import");
	}
}
