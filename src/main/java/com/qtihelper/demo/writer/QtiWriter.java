package com.qtihelper.demo.writer;

import com.qtihelper.demo.model.*;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class QtiWriter {

  private static final Logger log = LoggerFactory.getLogger(QtiWriter.class);
  private static final String RESPONSE_PREFIX = "response_";
  private static final String RENDER_CHOICE_TAG_CLOSE = "</render_choice></response_lid>";

  public void createQtiPackage(Quiz quiz, Path outputPath) throws IOException {
    Objects.requireNonNull(quiz, "Quiz object cannot be null");
    Objects.requireNonNull(outputPath, "Output path cannot be null");

    if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
      throw new IllegalArgumentException("Cannot create QTI package for a quiz with 0 questions.");
    }

    log.debug("Generating manifest and object bank XML...");
    String manifestXml = generateManifest();
    String bankXml = generateObjectBank(quiz);

    try (var fos = new FileOutputStream(outputPath.toFile());
        var zos = new ZipOutputStream(fos)) {

      ZipEntry manifestEntry = new ZipEntry("imsmanifest.xml");
      zos.putNextEntry(manifestEntry);
      zos.write(manifestXml.getBytes(StandardCharsets.UTF_8));
      zos.closeEntry();

      ZipEntry quizEntry = new ZipEntry("quiz_content.xml");
      zos.putNextEntry(quizEntry);
      zos.write(bankXml.getBytes(StandardCharsets.UTF_8));
      zos.closeEntry();

      log.debug("QTI ZIP write completed.");
    } catch (IOException e) {
      log.error("Failed to write QTI zip file", e);
      throw e;
    }
  }

  // ... (The internal generateX methods remain the same as previous logic, just
  // using 'log' instead of 'LOGGER') ...

  private String generateManifest() {
    return """
        <?xml version="1.0" encoding="UTF-8"?>
        <manifest identifier="man_%s" xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1">
          <metadata>
            <schema>IMS Content</schema>
            <schemaversion>1.1.3</schemaversion>
          </metadata>
          <resources>
            <resource identifier="res_quiz" type="imsqti_xmlv1p2">
               <file href="quiz_content.xml"/>
            </resource>
          </resources>
        </manifest>
        """.formatted(UUID.randomUUID().toString());
  }

  private String generateObjectBank(Quiz quiz) {
    StringBuilder itemsXml = new StringBuilder();
    for (Question q : quiz.getQuestions()) {
      if (q.getType() == null) {
        log.warn("Skipping question with missing Type: {}", q.getTitle());
        continue;
      }
      itemsXml.append(generateItem(q));
    }

    return """
        <?xml version="1.0" encoding="UTF-8"?>
        <questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <objectbank ident="bank_%s">
            <qtimetadata>
              <qtimetadatafield>
                <fieldlabel>bank_title</fieldlabel>
                <fieldentry>%s</fieldentry>
              </qtimetadatafield>
            </qtimetadata>
            %s
          </objectbank>
        </questestinterop>
        """
        .formatted(UUID.randomUUID().toString(), escape(quiz.getTitle()), itemsXml.toString());
  }

  private String generateItem(Question q) {
    String ident = "q_" + UUID.randomUUID().toString().replace("-", "");
    String questionTypeMeta = getCanvasQuestionType(q.getType());

    String presentation = switch (q.getType()) {
      case MATCHING -> generateMatchingPresentation(q);
      case MULTIPLE_DROPDOWN -> generateDropdownPresentation(q);
      case MULTIPLE_ANSWERS -> generateMultipleChoicePresentation(q, ident, true);
      default -> generateMultipleChoicePresentation(q, ident, false);
    };

    String processing = switch (q.getType()) {
      case MATCHING -> generateMatchingProcessing(q);
      case MULTIPLE_ANSWERS -> generateMultipleAnswerProcessing(q, ident);
      case MULTIPLE_DROPDOWN -> generateDropdownProcessing(q);
      default -> generateStandardProcessing(q, ident);
    };

    String feedbackBlocks = generateFeedbackBlocks(q);

    return """
        <item ident="%s" title="%s">
          <itemmetadata>
            <qtimetadata>
              <qtimetadatafield>
                <fieldlabel>points_possible</fieldlabel>
                <fieldentry>%s</fieldentry>
              </qtimetadatafield>
              <qtimetadatafield>
                <fieldlabel>question_type</fieldlabel>
                <fieldentry>%s</fieldentry>
              </qtimetadatafield>
            </qtimetadata>
          </itemmetadata>
          <presentation>
            <material>
              <mattext texttype="text/html">%s</mattext>
            </material>
            %s
          </presentation>
          %s
          %s
        </item>
        """.formatted(ident, escape(q.getTitle()), q.getPoints(), questionTypeMeta,
        formatHtml(q.getPromptText()), presentation, processing, feedbackBlocks);
  }

  // ... (Helper methods getCanvasQuestionType, generateMatchingPresentation etc.
  // follow the same logic as your original code, omitted for brevity but they are
  // included in the 'writer' logic) ...

  private String getCanvasQuestionType(QuestionType type) {
    if (type == null)
      return "multiple_choice_question";
    switch (type) {
      case MATCHING:
        return "matching_question";
      case MULTIPLE_DROPDOWN:
        return "multiple_dropdowns_question";
      case MULTIPLE_ANSWERS:
        return "multiple_answers_question";
      case TRUE_FALSE:
        return "true_false_question";
      default:
        return "multiple_choice_question";
    }
  }

  private String generateMultipleChoicePresentation(Question q, String itemIdent, boolean isMultiple) {
    StringBuilder sb = new StringBuilder();
    String cardinality = isMultiple ? "Multiple" : "Single";
    sb.append(("<response_lid ident=\"%s%s\" rcardinality=\"%s\"><render_choice>")
        .formatted(RESPONSE_PREFIX, itemIdent, cardinality));

    if (q.getAnswers() != null) {
      for (AnswerOption ans : q.getAnswers()) {
        String ansId = getAnswerId(ans.getText());
        sb.append("""
            <flow_label>
              <response_label ident="%s">
                <material><mattext texttype="text/html">%s</mattext></material>
              </response_label>
            </flow_label>
            """.formatted(ansId, escape(ans.getText())));
      }
    }
    sb.append(RENDER_CHOICE_TAG_CLOSE);
    return sb.toString();
  }

  private String generateMatchingPresentation(Question q) {
    StringBuilder sb = new StringBuilder();
    List<String> allRight = new ArrayList<>(q.getMatchingPairs().values());
    allRight.addAll(q.getMatchingDistractors());
    List<String> uniqueRight = allRight.stream().distinct().toList();
    for (Entry<String, String> entry : q.getMatchingPairs().entrySet()) {
      String leftText = entry.getKey();
      String responseId = RESPONSE_PREFIX + leftText.hashCode();
      sb.append("""
          <response_lid ident="%s">
            <material><mattext texttype="text/html">%s</mattext></material>
            <render_choice>
          """.formatted(responseId, escape(leftText)));
      for (String rightText : uniqueRight) {
        String rightId = getAnswerId(rightText);
        sb.append("""
            <response_label ident="%s">
              <material><mattext texttype="text/html">%s</mattext></material>
            </response_label>
            """.formatted(rightId, escape(rightText)));
      }
      sb.append(RENDER_CHOICE_TAG_CLOSE);
    }
    return sb.toString();
  }

  private String generateDropdownPresentation(Question q) {
    StringBuilder sb = new StringBuilder();
    Map<String, List<AnswerOption>> grouped = q.getAnswers().stream()
        .collect(Collectors.groupingBy(a -> Optional.ofNullable(a.getDropdownVariable()).orElse("unknown")));

    for (Map.Entry<String, List<AnswerOption>> entry : grouped.entrySet()) {
      String varName = entry.getKey();
      String responseId = RESPONSE_PREFIX + varName;
      sb.append("<response_lid ident=\"%s\"><render_choice>".formatted(responseId));
      for (AnswerOption ans : entry.getValue()) {
        String ansId = getAnswerId(ans.getText());
        sb.append("""
            <response_label ident="%s">
              <material><mattext texttype="text/html">%s</mattext></material>
            </response_label>
            """.formatted(ansId, escape(ans.getText())));
      }
      sb.append(RENDER_CHOICE_TAG_CLOSE);
    }
    return sb.toString();
  }

  private String generateStandardProcessing(Question q, String itemIdent) {
    String correctId = q.getAnswers().stream().filter(AnswerOption::isCorrect)
        .findFirst().map(a -> getAnswerId(a.getText())).orElse("");

    String correctFb = q.getCorrectFeedback() != null
        ? "<displayfeedback feedbacktype=\"Response\" linkrefid=\"correct_fb\"/>"
        : "";
    String incorrectFb = q.getIncorrectFeedback() != null
        ? "<displayfeedback feedbacktype=\"Response\" linkrefid=\"general_incorrect_fb\"/>"
        : "";
    String specificFeedbackChecks = generateSpecificFeedbackChecks(q, itemIdent);
    return """
        <resprocessing>
          <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0" maxvalue="100"/></outcomes>
          %s
          <respcondition continue="No">
            <conditionvar><varequal respident="%s%s">%s</varequal></conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
            %s
          </respcondition>
          <respcondition continue="Yes"><conditionvar><other/></conditionvar>%s</respcondition>
        </resprocessing>
        """.formatted(specificFeedbackChecks, RESPONSE_PREFIX, itemIdent, correctId, correctFb, incorrectFb);
  }

  private String generateMultipleAnswerProcessing(Question q, String itemIdent) {
    StringBuilder condition = new StringBuilder();
    condition.append("<and>");
    for (AnswerOption ans : q.getAnswers()) {
      String ansId = getAnswerId(ans.getText());
      if (ans.isCorrect()) {
        condition.append(
            "<varequal respident=\"%s%s\">%s</varequal>".formatted(RESPONSE_PREFIX, itemIdent, ansId));
      } else {
        condition.append("<not><varequal respident=\"%s%s\">%s</varequal></not>".formatted(RESPONSE_PREFIX,
            itemIdent, ansId));
      }
    }
    condition.append("</and>");
    String correctFb = q.getCorrectFeedback() != null
        ? "<displayfeedback feedbacktype=\"Response\" linkrefid=\"correct_fb\"/>"
        : "";
    return """
        <resprocessing>
          <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0" maxvalue="100"/></outcomes>
          <respcondition continue="No">
            <conditionvar>%s</conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
            %s
          </respcondition>
        </resprocessing>
        """.formatted(condition.toString(), correctFb);
  }

  private String generateMatchingProcessing(Question q) {
    double pointsPerMatch = 100.0 / Math.max(1, q.getMatchingPairs().size());
    String pointsStr = String.format("%.2f", pointsPerMatch);
    StringBuilder conditions = new StringBuilder();
    for (Map.Entry<String, String> entry : q.getMatchingPairs().entrySet()) {
      String leftText = entry.getKey();
      String responseId = RESPONSE_PREFIX + leftText.hashCode();
      String rightId = getAnswerId(entry.getValue());
      conditions.append("""
          <respcondition>
            <conditionvar><varequal respident="%s">%s</varequal></conditionvar>
            <setvar varname="SCORE" action="Add">%s</setvar>
          </respcondition>
          """.formatted(responseId, rightId, pointsStr));
    }
    return """
        <resprocessing>
          <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0" maxvalue="100"/></outcomes>
          %s
        </resprocessing>
        """.formatted(conditions.toString());
  }

  private String generateDropdownProcessing(Question q) {
    List<String> variables = q.getAnswers().stream().map(AnswerOption::getDropdownVariable).distinct().toList();
    double pointsPerVar = 100.0 / Math.max(1, variables.size());
    String pointsStr = String.format("%.2f", pointsPerVar);
    StringBuilder conditions = new StringBuilder();
    for (AnswerOption ans : q.getAnswers()) {
      if (ans.isCorrect()) {
        String responseId = RESPONSE_PREFIX + ans.getDropdownVariable();
        String ansId = getAnswerId(ans.getText());
        conditions.append("""
            <respcondition>
              <conditionvar><varequal respident="%s">%s</varequal></conditionvar>
              <setvar varname="SCORE" action="Add">%s</setvar>
            </respcondition>
            """.formatted(responseId, ansId, pointsStr));
      }
    }
    return """
        <resprocessing>
          <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0" maxvalue="100"/></outcomes>
          %s
        </resprocessing>
        """.formatted(conditions.toString());
  }

  private String generateSpecificFeedbackChecks(Question q, String itemIdent) {
    StringBuilder sb = new StringBuilder();
    for (AnswerOption ans : q.getAnswers()) {
      if (isAnswerHasFeedback(ans)) {
        String ansId = getAnswerId(ans.getText());
        String fbId = ansId + "_fb";
        sb.append("""
            <respcondition continue="Yes">
              <conditionvar><varequal respident="%s%s">%s</varequal></conditionvar>
              <displayfeedback feedbacktype="Response" linkrefid="%s"/>
            </respcondition>
            """.formatted(RESPONSE_PREFIX, itemIdent, ansId, fbId));
      }
    }
    return sb.toString();
  }

  private String generateFeedbackBlocks(Question q) {
    StringBuilder sb = new StringBuilder();
    if (q.getCorrectFeedback() != null)
      sb.append(buildFeedbackBlock("correct_fb", q.getCorrectFeedback()));
    if (q.getIncorrectFeedback() != null)
      sb.append(buildFeedbackBlock("general_incorrect_fb", q.getIncorrectFeedback()));
    if (q.getGeneralFeedback() != null)
      sb.append(buildFeedbackBlock("general_fb", q.getGeneralFeedback()));
    for (AnswerOption ans : q.getAnswers()) {
      if (isAnswerHasFeedback(ans)) {
        String fbId = getAnswerId(ans.getText()) + "_fb";
        sb.append(buildFeedbackBlock(fbId, ans.getFeedback()));
      }
    }
    return sb.toString();
  }

  private String buildFeedbackBlock(String ident, String text) {
    return """
        <itemfeedback ident="%s">
          <flow_mat><material><mattext texttype="text/html">%s</mattext></material></flow_mat>
        </itemfeedback>
        """.formatted(ident, formatHtml(text));
  }

  private boolean isAnswerHasFeedback(AnswerOption ans) {
    return ans.getFeedback() != null && !ans.getFeedback().isEmpty();
  }

  private String getAnswerId(String text) {
    if (text == null)
      return "ans_null_" + UUID.randomUUID().toString().substring(0, 4);
    return "ans_" + text.hashCode();
  }

  private String escape(String input) {
    if (input == null)
      return "";
    return input.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&apos;");
  }

  private String formatHtml(String input) {
    if (input == null)
      return "";
    String safe = escape(input);
    return safe.replaceAll("\\r?\\n", "<br/>");
  }
}