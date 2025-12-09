package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.quiz.UserAnswer;
import com.qtihelper.demo.dto.quiz.UserQuestion;
import com.qtihelper.demo.dto.quiz.UserQuizJson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for generating QTI 1.2 Content XML (quiz_content.xml).
 * Converts UserQuizJson into Canvas-compatible QTI format.
 */
@Service
public class QtiContentGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(QtiContentGeneratorService.class);

    /**
     * Generate complete QTI content XML for a quiz.
     *
     * @param quiz UserQuizJson object containing quiz data
     * @return XML string for quiz_content.xml
     */
    public String generateQtiContent(UserQuizJson quiz) {
        log.info("Generating QTI content for quiz: {}", quiz.getTitle());

        StringBuilder xml = new StringBuilder();

        // XML Declaration
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");

        // Object bank root
        String bankId = "qb_" + UUID.randomUUID().toString().replace("-", "");
        xml.append("<questestinterop xmlns=\"http://www.imsglobal.org/xsd/ims_qtiasiv1p2\" ");
        xml.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" ");
        xml.append("xsi:schemaLocation=\"http://www.imsglobal.org/xsd/ims_qtiasiv1p2 ");
        xml.append("http://www.imsglobal.org/xsd/ims_qtiasiv1p2p1.xsd\">\n");

        // Object bank (for question bank)
        xml.append("  <objectbank ident=\"").append(bankId).append("\">\n");

        // QTI metadata
        xml.append("    <qtimetadata>\n");
        xml.append("      <qtimetadatafield>\n");
        xml.append("        <fieldlabel>bank_title</fieldlabel>\n");
        xml.append("        <fieldentry>").append(escapeXml(quiz.getTitle())).append("</fieldentry>\n");
        xml.append("      </qtimetadatafield>\n");
        xml.append("    </qtimetadata>\n");

        // Generate each question (direct children of objectbank)
        for (int i = 0; i < quiz.getQuestions().size(); i++) {
            UserQuestion question = quiz.getQuestions().get(i);
            String questionXml = generateQuestion(question, i + 1);
            xml.append(questionXml);
        }

        xml.append("  </objectbank>\n");
        xml.append("</questestinterop>\n");

        log.info("Generated QTI content with {} questions ({} bytes)",
                quiz.getQuestions().size(), xml.length());
        return xml.toString();
    }

    /**
     * Generate XML for a single question based on its type.
     */
    private String generateQuestion(UserQuestion question, int questionNumber) {
        String type = question.getType().toUpperCase();

        log.debug("Generating question #{} (type: {})", questionNumber, type);

        return switch (type) {
            case "MC", "TF" -> generateMultipleChoice(question, questionNumber);
            case "MA" -> generateMultipleAnswer(question, questionNumber);
            case "MD", "DD" -> generateMultipleDropdown(question, questionNumber);
            case "MT" -> generateMatching(question, questionNumber);
            default -> {
                log.warn("Unsupported question type: {}, defaulting to MC", type);
                yield generateMultipleChoice(question, questionNumber);
            }
        };
    }

    /**
     * Generate Multiple Choice or True/False question.
     */
    private String generateMultipleChoice(UserQuestion question, int questionNumber) {
        String itemId = "question_" + UUID.randomUUID().toString().replace("-", "");
        String responseId = "response_" + UUID.randomUUID().toString().replace("-", "");

        StringBuilder xml = new StringBuilder();

        xml.append("    <item ident=\"").append(itemId).append("\" title=\"").append(escapeXml(question.getTitle())).append("\">\n");

        // Metadata
        xml.append("      <itemmetadata>\n");
        xml.append("        <qtimetadata>\n");
        xml.append("          <qtimetadatafield>\n");
        xml.append("            <fieldlabel>question_type</fieldlabel>\n");
        xml.append("            <fieldentry>multiple_choice_question</fieldentry>\n");
        xml.append("          </qtimetadatafield>\n");
        xml.append("          <qtimetadatafield>\n");
        xml.append("            <fieldlabel>points_possible</fieldlabel>\n");
        xml.append("            <fieldentry>").append(question.getPoints()).append("</fieldentry>\n");
        xml.append("          </qtimetadatafield>\n");
        xml.append("        </qtimetadata>\n");
        xml.append("      </itemmetadata>\n");

        // Presentation
        xml.append("      <presentation>\n");
        xml.append("        <material>\n");
        xml.append("          <mattext texttype=\"text/html\">").append(escapeXml(question.getPrompt())).append("</mattext>\n");
        xml.append("        </material>\n");

        // Response (Single cardinality for MC/TF)
        xml.append("        <response_lid ident=\"").append(responseId).append("\" rcardinality=\"Single\">\n");
        xml.append("          <render_choice>\n");

        // Answer choices
        for (int i = 0; i < question.getAnswers().size(); i++) {
            UserAnswer answer = question.getAnswers().get(i);
            String answerId = "answer_" + i;

            xml.append("            <response_label ident=\"").append(answerId).append("\">\n");
            xml.append("              <material>\n");
            xml.append("                <mattext texttype=\"text/plain\">").append(escapeXml(answer.getText())).append("</mattext>\n");
            xml.append("              </material>\n");
            xml.append("            </response_label>\n");
        }

        xml.append("          </render_choice>\n");
        xml.append("        </response_lid>\n");
        xml.append("      </presentation>\n");

        // Response processing
        xml.append(generateResponseProcessingWithPerAnswerFeedback(question, responseId));

        // Feedback
        xml.append(generateFeedback(question));

        xml.append("    </item>\n");

        return xml.toString();
    }

    /**
     * Generate Multiple Answer question.
     */
    private String generateMultipleAnswer(UserQuestion question, int questionNumber) {
        String itemId = "question_" + UUID.randomUUID().toString().replace("-", "");
        String responseId = "response_" + UUID.randomUUID().toString().replace("-", "");

        StringBuilder xml = new StringBuilder();

        xml.append("    <item ident=\"").append(itemId).append("\" title=\"").append(escapeXml(question.getTitle())).append("\">\n");

        // Metadata
        xml.append("      <itemmetadata>\n");
        xml.append("        <qtimetadata>\n");
        xml.append("          <qtimetadatafield>\n");
        xml.append("            <fieldlabel>question_type</fieldlabel>\n");
        xml.append("            <fieldentry>multiple_answers_question</fieldentry>\n");
        xml.append("          </qtimetadatafield>\n");
        xml.append("          <qtimetadatafield>\n");
        xml.append("            <fieldlabel>points_possible</fieldlabel>\n");
        xml.append("            <fieldentry>").append(question.getPoints()).append("</fieldentry>\n");
        xml.append("          </qtimetadatafield>\n");
        xml.append("        </qtimetadata>\n");
        xml.append("      </itemmetadata>\n");

        // Presentation
        xml.append("      <presentation>\n");
        xml.append("        <material>\n");
        xml.append("          <mattext texttype=\"text/html\">").append(escapeXml(question.getPrompt())).append("</mattext>\n");
        xml.append("        </material>\n");

        // Response (Multiple cardinality for MA)
        xml.append("        <response_lid ident=\"").append(responseId).append("\" rcardinality=\"Multiple\">\n");
        xml.append("          <render_choice>\n");

        // Answer choices
        for (int i = 0; i < question.getAnswers().size(); i++) {
            UserAnswer answer = question.getAnswers().get(i);
            String answerId = "answer_" + i;

            xml.append("            <response_label ident=\"").append(answerId).append("\">\n");
            xml.append("              <material>\n");
            xml.append("                <mattext texttype=\"text/plain\">").append(escapeXml(answer.getText())).append("</mattext>\n");
            xml.append("              </material>\n");
            xml.append("            </response_label>\n");
        }

        xml.append("          </render_choice>\n");
        xml.append("        </response_lid>\n");
        xml.append("      </presentation>\n");

        // Response processing
        xml.append(generateResponseProcessingWithPerAnswerFeedback(question, responseId));

        // Feedback
        xml.append(generateFeedback(question));

        xml.append("    </item>\n");

        return xml.toString();
    }

    /**
     * Generate Multiple Dropdown question.
     */
    private String generateMultipleDropdown(UserQuestion question, int questionNumber) {
        // For now, treat as multiple choice
        // TODO: Implement proper multiple dropdown logic with blank_id mapping
        log.warn("Multiple Dropdown questions converted to Multiple Choice format");
        return generateMultipleChoice(question, questionNumber);
    }

    /**
     * Generate Matching question.
     */
    private String generateMatching(UserQuestion question, int questionNumber) {
        // Simplified matching - would need proper match pairs
        log.warn("Matching questions have simplified implementation");
        return generateMultipleChoice(question, questionNumber);
    }

    /**
     * Generate response processing block.
     */
    private String generateResponseProcessing(UserQuestion question, String responseId) {
        StringBuilder xml = new StringBuilder();

        xml.append("      <resprocessing>\n");
        xml.append("        <outcomes>\n");
        xml.append("          <decvar maxvalue=\"100\" minvalue=\"0\" varname=\"SCORE\" vartype=\"Decimal\"/>\n");
        xml.append("        </outcomes>\n");

        // Get correct answers
        List<String> correctAnswerIds = question.getAnswers().stream()
                .filter(a -> a.getCorrect() != null && a.getCorrect())
                .map(a -> "answer_" + question.getAnswers().indexOf(a))
                .collect(Collectors.toList());

        // Correct response condition
        if (!correctAnswerIds.isEmpty()) {
            xml.append("        <respcondition continue=\"No\">\n");
            xml.append("          <conditionvar>\n");

            if (correctAnswerIds.size() == 1) {
                // Single correct answer
                xml.append("            <varequal respident=\"").append(responseId).append("\">")
                   .append(correctAnswerIds.get(0)).append("</varequal>\n");
            } else {
                // Multiple correct answers - use AND logic
                xml.append("            <and>\n");
                for (String answerId : correctAnswerIds) {
                    xml.append("              <varequal respident=\"").append(responseId).append("\">")
                       .append(answerId).append("</varequal>\n");
                }
                xml.append("            </and>\n");
            }

            xml.append("          </conditionvar>\n");
            xml.append("          <setvar action=\"Set\" varname=\"SCORE\">100</setvar>\n");
            xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"correct_fb\"/>\n");
            xml.append("        </respcondition>\n");
        }

        // Incorrect response condition
        xml.append("        <respcondition continue=\"Yes\">\n");
        xml.append("          <conditionvar>\n");
        xml.append("            <other/>\n");
        xml.append("          </conditionvar>\n");
        xml.append("          <setvar action=\"Set\" varname=\"SCORE\">0</setvar>\n");
        xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"incorrect_fb\"/>\n");
        xml.append("        </respcondition>\n");

        xml.append("      </resprocessing>\n");

        return xml.toString();
    }

    /**
     * Generate response processing block with per-answer feedback (N+2 conditions).
     * Implements the ObjectBank format requirement for granular feedback.
     */
    private String generateResponseProcessingWithPerAnswerFeedback(UserQuestion question, String responseId) {
        StringBuilder xml = new StringBuilder();

        xml.append("      <resprocessing>\n");
        xml.append("        <outcomes>\n");
        xml.append("          <decvar maxvalue=\"100\" minvalue=\"0\" varname=\"SCORE\" vartype=\"Decimal\"/>\n");
        xml.append("        </outcomes>\n");

        // Get correct answer identifiers
        List<String> correctAnswerIds = question.getAnswers().stream()
                .filter(a -> a.getCorrect() != null && a.getCorrect())
                .map(a -> "answer_" + question.getAnswers().indexOf(a))
                .collect(Collectors.toList());

        // PHASE 1: Per-answer feedback conditions (continue="Yes")
        // Loop through all answers to create feedback conditions
        for (int i = 0; i < question.getAnswers().size(); i++) {
            UserAnswer answer = question.getAnswers().get(i);
            String answerId = "answer_" + i;

            // Only generate if answer has specific feedback
            if (answer.getFeedback() != null && !answer.getFeedback().isBlank()) {
                xml.append("        <respcondition continue=\"Yes\">\n");
                xml.append("          <conditionvar>\n");
                xml.append("            <varequal respident=\"").append(responseId).append("\">")
                   .append(answerId).append("</varequal>\n");
                xml.append("          </conditionvar>\n");
                xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"")
                   .append(answerId).append("_fb\"/>\n");
                xml.append("        </respcondition>\n");
            }
        }

        // PHASE 2: General feedback condition (continue="Yes")
        if (question.getGeneralFeedback() != null && !question.getGeneralFeedback().isBlank()) {
            xml.append("        <respcondition continue=\"Yes\">\n");
            xml.append("          <conditionvar>\n");
            xml.append("            <other/>\n");
            xml.append("          </conditionvar>\n");
            xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"general_fb\"/>\n");
            xml.append("        </respcondition>\n");
        }

        // PHASE 3: Scoring condition - Correct match (continue="No")
        if (!correctAnswerIds.isEmpty()) {
            xml.append("        <respcondition continue=\"No\">\n");
            xml.append("          <conditionvar>\n");

            if (correctAnswerIds.size() == 1) {
                // Single correct answer
                xml.append("            <varequal respident=\"").append(responseId).append("\">")
                   .append(correctAnswerIds.get(0)).append("</varequal>\n");
            } else {
                // Multiple correct answers - use AND logic
                xml.append("            <and>\n");
                for (String answerId : correctAnswerIds) {
                    xml.append("              <varequal respident=\"").append(responseId).append("\">")
                       .append(answerId).append("</varequal>\n");
                }
                xml.append("            </and>\n");
            }

            xml.append("          </conditionvar>\n");
            xml.append("          <setvar action=\"Set\" varname=\"SCORE\">100</setvar>\n");

            // Display correct feedback if present
            if (question.getCorrectFeedback() != null && !question.getCorrectFeedback().isBlank()) {
                xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"correct_fb\"/>\n");
            }

            xml.append("        </respcondition>\n");
        }

        // PHASE 4: Incorrect fallback (continue="No")
        xml.append("        <respcondition continue=\"No\">\n");
        xml.append("          <conditionvar>\n");
        xml.append("            <other/>\n");
        xml.append("          </conditionvar>\n");
        xml.append("          <setvar action=\"Set\" varname=\"SCORE\">0</setvar>\n");

        // Display incorrect feedback if present
        if (question.getIncorrectFeedback() != null && !question.getIncorrectFeedback().isBlank()) {
            xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"incorrect_fb\"/>\n");
        }

        xml.append("        </respcondition>\n");

        xml.append("      </resprocessing>\n");

        return xml.toString();
    }

    /**
     * Generate feedback blocks (including per-answer feedback).
     */
    private String generateFeedback(UserQuestion question) {
        StringBuilder xml = new StringBuilder();

        // Per-answer feedback blocks
        for (int i = 0; i < question.getAnswers().size(); i++) {
            UserAnswer answer = question.getAnswers().get(i);
            String answerId = "answer_" + i;

            // Only generate if answer has specific feedback
            if (answer.getFeedback() != null && !answer.getFeedback().isBlank()) {
                xml.append("      <itemfeedback ident=\"").append(answerId).append("_fb\">\n");
                xml.append("        <flow_mat>\n");
                xml.append("          <material>\n");
                xml.append("            <mattext texttype=\"text/html\">")
                   .append(escapeXml(answer.getFeedback())).append("</mattext>\n");
                xml.append("          </material>\n");
                xml.append("        </flow_mat>\n");
                xml.append("      </itemfeedback>\n");
            }
        }

        // General feedback
        if (question.getGeneralFeedback() != null && !question.getGeneralFeedback().isBlank()) {
            xml.append("      <itemfeedback ident=\"general_fb\">\n");
            xml.append("        <flow_mat>\n");
            xml.append("          <material>\n");
            xml.append("            <mattext texttype=\"text/html\">")
               .append(escapeXml(question.getGeneralFeedback())).append("</mattext>\n");
            xml.append("          </material>\n");
            xml.append("        </flow_mat>\n");
            xml.append("      </itemfeedback>\n");
        }

        // Correct feedback
        if (question.getCorrectFeedback() != null && !question.getCorrectFeedback().isBlank()) {
            xml.append("      <itemfeedback ident=\"correct_fb\">\n");
            xml.append("        <flow_mat>\n");
            xml.append("          <material>\n");
            xml.append("            <mattext texttype=\"text/html\">")
               .append(escapeXml(question.getCorrectFeedback())).append("</mattext>\n");
            xml.append("          </material>\n");
            xml.append("        </flow_mat>\n");
            xml.append("      </itemfeedback>\n");
        }

        // Incorrect feedback
        if (question.getIncorrectFeedback() != null && !question.getIncorrectFeedback().isBlank()) {
            xml.append("      <itemfeedback ident=\"incorrect_fb\">\n");
            xml.append("        <flow_mat>\n");
            xml.append("          <material>\n");
            xml.append("            <mattext texttype=\"text/html\">")
               .append(escapeXml(question.getIncorrectFeedback())).append("</mattext>\n");
            xml.append("          </material>\n");
            xml.append("        </flow_mat>\n");
            xml.append("      </itemfeedback>\n");
        }

        return xml.toString();
    }

    /**
     * Escape special XML characters.
     */
    private String escapeXml(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&apos;");
    }
}
