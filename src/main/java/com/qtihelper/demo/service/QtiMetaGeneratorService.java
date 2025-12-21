package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.quiz.UserQuestion;
import com.qtihelper.demo.dto.quiz.UserQuizJson;
import com.qtihelper.demo.util.XmlUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service for generating Canvas assessment_meta.xml file.
 * This file is a Canvas-specific extension that defines quiz settings
 * such as quiz type, attempts, time limits, and assignment configuration.
 */
@Service
public class QtiMetaGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(QtiMetaGeneratorService.class);

    /**
     * Generate assessment_meta.xml content for Canvas import.
     *
     * @param quiz            UserQuizJson object containing quiz data
     * @param assessmentIdent The assessment identifier from the QTI content
     * @return XML string for assessment_meta.xml
     */
    public String generateAssessmentMeta(UserQuizJson quiz, String assessmentIdent) {
        log.info("Generating assessment_meta.xml for: {}", quiz.getTitle());

        StringBuilder xml = new StringBuilder();

        // XML Declaration
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");

        // Quiz root with Canvas namespace
        xml.append("<quiz identifier=\"").append(assessmentIdent).append("\" ");
        xml.append("xmlns=\"http://canvas.instructure.com/xsd/cccv1p0\" ");
        xml.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" ");
        xml.append("xsi:schemaLocation=\"http://canvas.instructure.com/xsd/cccv1p0 ");
        xml.append("https://canvas.instructure.com/xsd/cccv1p0.xsd\">\n");

        // Quiz metadata
        xml.append("  <title>").append(XmlUtils.escape(quiz.getTitle())).append("</title>\n");

        String description = quiz.getDescription() != null ? quiz.getDescription() : "";
        xml.append("  <description>").append(XmlUtils.escape(description)).append("</description>\n");

        // Get quiz settings (uses defaults if not provided)
        var settings = quiz.getSettings();

        // Quiz settings
        xml.append("  <shuffle_answers>").append(settings.shuffleAnswers()).append("</shuffle_answers>\n");
        xml.append("  <scoring_policy>").append(settings.scoringPolicy()).append("</scoring_policy>\n");
        xml.append("  <hide_results></hide_results>\n");
        xml.append("  <quiz_type>").append(settings.quizType()).append("</quiz_type>\n");

        // Calculate total points
        double totalPoints = quiz.getQuestions().stream()
                .mapToDouble(UserQuestion::getPoints)
                .sum();
        xml.append("  <points_possible>").append(totalPoints).append("</points_possible>\n");

        // Additional quiz settings
        xml.append("  <require_lockdown_browser>false</require_lockdown_browser>\n");
        xml.append("  <require_lockdown_browser_for_results>false</require_lockdown_browser_for_results>\n");
        xml.append("  <require_lockdown_browser_monitor>false</require_lockdown_browser_monitor>\n");
        xml.append("  <lockdown_browser_monitor_data/>\n");
        xml.append("  <show_correct_answers>").append(settings.showCorrectAnswers())
                .append("</show_correct_answers>\n");
        xml.append("  <anonymous_submissions>false</anonymous_submissions>\n");
        xml.append("  <could_be_locked>false</could_be_locked>\n");
        xml.append("  <disable_timer_autosubmission>false</disable_timer_autosubmission>\n");
        xml.append("  <allowed_attempts>").append(settings.allowedAttempts()).append("</allowed_attempts>\n");
        xml.append("  <one_question_at_a_time>").append(settings.oneQuestionAtATime())
                .append("</one_question_at_a_time>\n");
        xml.append("  <cant_go_back>").append(settings.cantGoBack()).append("</cant_go_back>\n");

        // Time limit (only include if set)
        if (settings.timeLimit() != null) {
            xml.append("  <time_limit>").append(settings.timeLimit()).append("</time_limit>\n");
        }

        xml.append("  <available>true</available>\n");
        xml.append("  <one_time_results>false</one_time_results>\n");
        xml.append("  <show_correct_answers_last_attempt>false</show_correct_answers_last_attempt>\n");
        xml.append("  <only_visible_to_overrides>false</only_visible_to_overrides>\n");
        xml.append("  <module_locked>false</module_locked>\n");

        // Assignment metadata (links Quiz to Assignments gradebook)
        String assignmentIdent = "a" + assessmentIdent.substring(1); // Replace 'g' with 'a'
        xml.append("  <assignment identifier=\"").append(assignmentIdent).append("\">\n");
        xml.append("    <title>").append(XmlUtils.escape(quiz.getTitle())).append("</title>\n");

        // Due dates (use settings if provided)
        if (settings.dueAt() != null) {
            xml.append("    <due_at>").append(settings.dueAt()).append("</due_at>\n");
        } else {
            xml.append("    <due_at/>\n");
        }

        if (settings.lockAt() != null) {
            xml.append("    <lock_at>").append(settings.lockAt()).append("</lock_at>\n");
        } else {
            xml.append("    <lock_at/>\n");
        }

        if (settings.unlockAt() != null) {
            xml.append("    <unlock_at>").append(settings.unlockAt()).append("</unlock_at>\n");
        } else {
            xml.append("    <unlock_at/>\n");
        }

        xml.append("    <module_locked>false</module_locked>\n");
        xml.append("    <workflow_state>published</workflow_state>\n");
        xml.append("    <assignment_overrides>\n");
        xml.append("    </assignment_overrides>\n");
        xml.append("    <quiz_identifierref>").append(assessmentIdent).append("</quiz_identifierref>\n");
        xml.append("    <allowed_extensions></allowed_extensions>\n");
        xml.append("    <has_group_category>false</has_group_category>\n");
        xml.append("    <points_possible>").append(totalPoints).append("</points_possible>\n");
        xml.append("    <grading_type>points</grading_type>\n");
        xml.append("    <all_day>false</all_day>\n");
        xml.append("    <submission_types>online_quiz</submission_types>\n");
        xml.append("    <position>1</position>\n");
        xml.append("    <turnitin_enabled>false</turnitin_enabled>\n");
        xml.append("    <vericite_enabled>false</vericite_enabled>\n");
        xml.append("    <peer_review_count>0</peer_review_count>\n");
        xml.append("    <peer_reviews>false</peer_reviews>\n");
        xml.append("    <automatic_peer_reviews>false</automatic_peer_reviews>\n");
        xml.append("    <anonymous_peer_reviews>false</anonymous_peer_reviews>\n");
        xml.append("    <grade_group_students_individually>false</grade_group_students_individually>\n");
        xml.append("    <freeze_on_copy>false</freeze_on_copy>\n");
        xml.append("    <omit_from_final_grade>false</omit_from_final_grade>\n");
        xml.append("    <hide_in_gradebook>false</hide_in_gradebook>\n");
        xml.append("    <intra_group_peer_reviews>false</intra_group_peer_reviews>\n");
        xml.append("    <only_visible_to_overrides>false</only_visible_to_overrides>\n");
        xml.append("    <post_to_sis>false</post_to_sis>\n");
        xml.append("    <moderated_grading>false</moderated_grading>\n");
        xml.append("    <grader_count>0</grader_count>\n");
        xml.append("    <grader_comments_visible_to_graders>true</grader_comments_visible_to_graders>\n");
        xml.append("    <anonymous_grading>false</anonymous_grading>\n");
        xml.append("    <graders_anonymous_to_graders>false</graders_anonymous_to_graders>\n");
        xml.append("    <grader_names_visible_to_final_grader>true</grader_names_visible_to_final_grader>\n");
        xml.append("    <anonymous_instructor_annotations>false</anonymous_instructor_annotations>\n");
        xml.append("    <post_policy>\n");
        xml.append("      <post_manually>false</post_manually>\n");
        xml.append("    </post_policy>\n");
        xml.append("  </assignment>\n");

        // Assignment group reference (optional, can be left empty)
        xml.append("  <assignment_group_identifierref/>\n");
        xml.append("  <assignment_overrides>\n");
        xml.append("  </assignment_overrides>\n");

        xml.append("</quiz>\n");

        log.info("Generated assessment_meta.xml ({} bytes)", xml.length());
        return xml.toString();
    }

}
