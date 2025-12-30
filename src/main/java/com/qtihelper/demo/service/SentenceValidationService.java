package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.TokenResult;
import com.qtihelper.demo.dto.ValidationResultDTO;
import com.qtihelper.demo.dto.ViolationDTO;
import com.qtihelper.demo.entity.GrammarRuleV4;
import com.qtihelper.demo.entity.RuleCondition;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.entity.VocabTag;
import com.qtihelper.demo.repository.GrammarRuleV4Repository;
import com.qtihelper.demo.repository.RuleConditionRepository;
import com.qtihelper.demo.repository.VocabRepository;
import com.qtihelper.demo.repository.VocabTagMappingRepository;
import com.qtihelper.demo.util.ConjugationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Core validation engine for Grammar Coach V4.1.
 * Validates sentences against active grammar rules.
 * 
 * Responsibility: Semantic validation of Japanese sentences
 * Dependencies: TokenizerService, GrammarRuleV4Repository,
 * RuleConditionRepository, VocabTagService, ConjugationMapper
 */
@Service
public class SentenceValidationService {

    private static final Logger log = LoggerFactory.getLogger(SentenceValidationService.class);

    private final TokenizerService tokenizerService;
    private final GrammarRuleV4Repository ruleRepository;
    private final RuleConditionRepository conditionRepository;
    private final VocabRepository vocabRepository;
    private final VocabTagMappingRepository tagMappingRepository;

    public SentenceValidationService(
            TokenizerService tokenizerService,
            GrammarRuleV4Repository ruleRepository,
            RuleConditionRepository conditionRepository,
            VocabRepository vocabRepository,
            VocabTagMappingRepository tagMappingRepository) {
        this.tokenizerService = tokenizerService;
        this.ruleRepository = ruleRepository;
        this.conditionRepository = conditionRepository;
        this.vocabRepository = vocabRepository;
        this.tagMappingRepository = tagMappingRepository;
    }

    /**
     * Validate a sentence against all active grammar rules.
     * 
     * @param text Sentence to validate
     * @return ValidationResultDTO with validity and any violations
     */
    public ValidationResultDTO validate(String text) {
        if (text == null || text.isBlank()) {
            return new ValidationResultDTO(true, List.of());
        }

        log.debug("Validating sentence: {}", text);

        // 1. Tokenize with Sudachi
        List<TokenResult> tokens = tokenizerService.tokenize(text);
        log.debug("Tokenized to {} tokens", tokens.size());

        // 2. Load active rules
        List<GrammarRuleV4> activeRules = ruleRepository.findByIsActiveTrue();
        log.debug("Found {} active rules", activeRules.size());

        // 3. Evaluate each rule
        List<ViolationDTO> allViolations = new ArrayList<>();
        for (GrammarRuleV4 rule : activeRules) {
            List<ViolationDTO> violations = evaluateRule(rule, tokens);
            allViolations.addAll(violations);
        }

        // 4. Return result
        boolean isValid = allViolations.isEmpty();
        log.debug("Validation result: {} ({} violations)", isValid ? "VALID" : "INVALID", allViolations.size());

        return new ValidationResultDTO(isValid, allViolations);
    }

    /**
     * Evaluate a single rule against tokens.
     */
    private List<ViolationDTO> evaluateRule(GrammarRuleV4 rule, List<TokenResult> tokens) {
        return switch (rule.getRuleType()) {
            case "PARTICLE" -> evaluateParticleRule(rule, tokens);
            case "PATTERN" -> evaluatePatternRule(rule, tokens);
            case "VERB_PARTICLE" -> evaluateVerbParticleRule(rule, tokens);
            default -> {
                log.warn("Unknown rule type: {}", rule.getRuleType());
                yield List.of();
            }
        };
    }

    /**
     * Evaluate a PARTICLE rule.
     * Checks conditions on words before/after the particle.
     */
    private List<ViolationDTO> evaluateParticleRule(GrammarRuleV4 rule, List<TokenResult> tokens) {
        List<ViolationDTO> violations = new ArrayList<>();
        String targetParticle = rule.getParticle();

        if (targetParticle == null || targetParticle.isBlank()) {
            return violations;
        }

        // Find particle occurrences
        for (int i = 0; i < tokens.size(); i++) {
            TokenResult token = tokens.get(i);
            if ("助詞".equals(token.posLevel1()) && targetParticle.equals(token.surface())) {
                // Get conditions for this rule
                List<RuleCondition> conditions = conditionRepository
                        .findByRuleIdOrderByConditionOrder(rule.getId());

                // Evaluate each condition
                for (RuleCondition cond : conditions) {
                    TokenResult target = getTargetToken(tokens, i, cond.getTargetPosition());
                    if (target != null && !evaluateCondition(cond, target)) {
                        String message = cond.getErrorMessage();
                        if (message != null) {
                            message = message.replace("{word}", target.surface());
                        } else {
                            message = "Validation failed for " + target.surface();
                        }
                        violations.add(new ViolationDTO(
                                rule.getId(),
                                rule.getName(),
                                message,
                                target.startOffset(),
                                target.surface()));
                    }
                }
            }
        }

        return violations;
    }

    /**
     * Evaluate a PATTERN rule.
     * Checks for pattern matches in token stream and validates verb forms.
     */
    private List<ViolationDTO> evaluatePatternRule(GrammarRuleV4 rule, List<TokenResult> tokens) {
        List<ViolationDTO> violations = new ArrayList<>();
        String pattern = rule.getPattern();

        if (pattern == null || pattern.isBlank()) {
            return violations;
        }

        // Get conditions for this rule
        List<RuleCondition> conditions = conditionRepository
                .findByRuleIdOrderByConditionOrder(rule.getId());

        // Find pattern in token stream by concatenating surfaces
        for (int i = 0; i < tokens.size(); i++) {
            int patternEndIndex = matchesPatternInStream(tokens, i, pattern);
            if (patternEndIndex != -1) {
                // Found pattern starting at index i
                log.debug("Found pattern '{}' at token index {}", pattern, i);

                for (RuleCondition cond : conditions) {
                    if ("BEFORE".equals(cond.getTargetPosition())) {
                        // Check verb form BEFORE the pattern
                        TokenResult beforeToken = i > 0 ? tokens.get(i - 1) : null;
                        TokenResult currentToken = tokens.get(i);

                        if (beforeToken != null && !evaluateConditionWithNext(cond, beforeToken, currentToken)) {
                            String message = cond.getErrorMessage();
                            if (message != null) {
                                message = message.replace("{word}", beforeToken.surface());
                            } else {
                                message = "Pattern validation failed for " + beforeToken.surface();
                            }
                            violations.add(new ViolationDTO(
                                    rule.getId(),
                                    rule.getName(),
                                    message,
                                    beforeToken.startOffset(),
                                    beforeToken.surface()));
                        }
                    } else {
                        // Handle other positions normally
                        TokenResult target = getTargetToken(tokens, i, cond.getTargetPosition());
                        if (target != null && !evaluateCondition(cond, target)) {
                            String message = cond.getErrorMessage();
                            if (message != null) {
                                message = message.replace("{word}", target.surface());
                            } else {
                                message = "Pattern validation failed for " + target.surface();
                            }
                            violations.add(new ViolationDTO(
                                    rule.getId(),
                                    rule.getName(),
                                    message,
                                    target.startOffset(),
                                    target.surface()));
                        }
                    }
                }
            }
        }

        return violations;
    }

    /**
     * Check if pattern exists in token stream starting at given index.
     * 
     * @return End index of pattern match, or -1 if not found
     */
    private int matchesPatternInStream(List<TokenResult> tokens, int start, String pattern) {
        StringBuilder sb = new StringBuilder();
        for (int i = start; i < Math.min(start + 5, tokens.size()); i++) {
            sb.append(tokens.get(i).surface());
            if (sb.toString().contains(pattern)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Evaluate a VERB_PARTICLE rule.
     * Handles edge case verbs that take unexpected particles (e.g., 住む→に, 働く→で).
     */
    private List<ViolationDTO> evaluateVerbParticleRule(GrammarRuleV4 rule, List<TokenResult> tokens) {
        List<ViolationDTO> violations = new ArrayList<>();
        String verbBaseForm = rule.getPattern(); // pattern holds verb baseForm

        if (verbBaseForm == null || verbBaseForm.isBlank()) {
            return violations;
        }

        // Find the specific verb
        for (int i = 0; i < tokens.size(); i++) {
            TokenResult token = tokens.get(i);

            if ("動詞".equals(token.posLevel1()) && verbBaseForm.equals(token.baseForm())) {
                log.debug("Found target verb '{}' at index {}", verbBaseForm, i);

                // Get conditions for this rule
                List<RuleCondition> conditions = conditionRepository
                        .findByRuleIdOrderByConditionOrder(rule.getId());

                for (RuleCondition cond : conditions) {
                    if ("REQUIRES_PARTICLE".equals(cond.getConditionType())) {
                        String requiredParticle = cond.getConditionValue();
                        String actualParticle = findParticleBefore(tokens, i);

                        if (actualParticle != null && !actualParticle.equals(requiredParticle)) {
                            String message = cond.getErrorMessage();
                            if (message == null) {
                                message = String.format("%s requires particle %s, not %s",
                                        token.baseForm(), requiredParticle, actualParticle);
                            }
                            violations.add(new ViolationDTO(
                                    rule.getId(),
                                    rule.getName(),
                                    message,
                                    token.startOffset(),
                                    token.surface()));
                        }
                    }
                }
            }
        }

        return violations;
    }

    /**
     * Find the particle before a verb by walking backwards.
     */
    private String findParticleBefore(List<TokenResult> tokens, int verbIndex) {
        for (int i = verbIndex - 1; i >= 0; i--) {
            TokenResult t = tokens.get(i);
            if ("助詞".equals(t.posLevel1())) {
                return t.surface();
            }
            if ("名詞".equals(t.posLevel1())) {
                continue; // Skip nouns, keep looking for particle
            }
            break; // Stop if we hit something else
        }
        return null;
    }

    /**
     * Get the target token based on position relative to reference token.
     */
    private TokenResult getTargetToken(List<TokenResult> tokens, int referenceIndex, String position) {
        return switch (position) {
            case "BEFORE" -> referenceIndex > 0 ? tokens.get(referenceIndex - 1) : null;
            case "AFTER" -> referenceIndex < tokens.size() - 1 ? tokens.get(referenceIndex + 1) : null;
            case "OBJECT" -> findObjectToken(tokens, referenceIndex);
            case "VERB" -> findVerbToken(tokens);
            case "ANY" -> referenceIndex < tokens.size() ? tokens.get(referenceIndex) : null;
            default -> null;
        };
    }

    /**
     * Find the object token (word before particle).
     */
    private TokenResult findObjectToken(List<TokenResult> tokens, int particleIndex) {
        return particleIndex > 0 ? tokens.get(particleIndex - 1) : null;
    }

    /**
     * Find the verb token in the sentence.
     */
    private TokenResult findVerbToken(List<TokenResult> tokens) {
        for (TokenResult token : tokens) {
            if ("動詞".equals(token.posLevel1())) {
                return token;
            }
        }
        return null;
    }

    /**
     * Evaluate a single condition against a token.
     */
    private boolean evaluateCondition(RuleCondition condition, TokenResult token) {
        return evaluateConditionWithNext(condition, token, null);
    }

    /**
     * Evaluate a single condition against a token, with optional next token for
     * combined form detection.
     */
    private boolean evaluateConditionWithNext(RuleCondition condition, TokenResult token, TokenResult nextToken) {
        String condType = condition.getConditionType();
        String condValue = condition.getConditionValue();

        return switch (condType) {
            case "HAS_TAG" -> hasTag(token, condValue);
            case "NOT_HAS_TAG" -> !hasTag(token, condValue);
            case "IS_VERB" -> isVerb(token, condValue);
            case "VERB_FORM" -> hasVerbForm(token, condValue, nextToken);
            case "IS_POS" -> condValue.equals(token.posLevel1());
            case "MATCHES" -> token.surface().matches(condValue);
            case "REQUIRES_PARTICLE" -> true; // Handled separately in VERB_PARTICLE rule
            default -> {
                log.warn("Unknown condition type: {}", condType);
                yield true; // Unknown condition, assume pass
            }
        };
    }

    /**
     * Check if a token has a specific tag.
     * Looks up the vocab by base form and checks associated tags.
     */
    private boolean hasTag(TokenResult token, String tagName) {
        // Find vocab by base form
        List<Vocab> vocabs = vocabRepository.findByBaseForm(token.baseForm());
        if (vocabs.isEmpty()) {
            // Try surface form as fallback
            vocabs = vocabRepository.findByDisplayForm(token.surface());
        }

        if (vocabs.isEmpty()) {
            return false; // No vocab found, no tags
        }

        // Check if any vocab has the tag
        for (Vocab vocab : vocabs) {
            List<String> tags = tagMappingRepository.findTagNamesByVocabId(vocab.getId());
            if (tags.contains(tagName)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if token is a specific verb.
     */
    private boolean isVerb(TokenResult token, String verbBaseForm) {
        return "動詞".equals(token.posLevel1()) && verbBaseForm.equals(token.baseForm());
    }

    /**
     * Check if token has a specific verb form using ConjugationMapper.
     * Handles both Sudachi conjugation forms and combined forms (te-form,
     * masu-form, etc.).
     */
    private boolean hasVerbForm(TokenResult token, String requiredForm, TokenResult nextToken) {
        if (!"動詞".equals(token.posLevel1())) {
            return false;
        }

        // Try direct mapping match first
        String sudachiForm = token.conjugationForm();
        if (ConjugationMapper.matchesForm(sudachiForm, requiredForm)) {
            return true;
        }

        // Try combined form detection (te-form, ta-form, nai-form, masu-form)
        String nextSurface = nextToken != null ? nextToken.surface() : null;
        String combinedForm = ConjugationMapper.detectCombinedForm(token.surface(), nextSurface);
        return requiredForm.equals(combinedForm);
    }
}
