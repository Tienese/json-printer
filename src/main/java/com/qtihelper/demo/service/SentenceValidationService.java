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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Core validation engine for Grammar Coach V4.0.
 * Validates sentences against active grammar rules.
 * 
 * Responsibility: Semantic validation of Japanese sentences
 * Dependencies: TokenizerService, GrammarRuleV4Repository,
 * RuleConditionRepository, VocabTagService
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
     * Checks for pattern matches in token stream.
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

        // Check each token against pattern
        for (int i = 0; i < tokens.size(); i++) {
            TokenResult token = tokens.get(i);
            if (token.surface().matches(pattern) || token.baseForm().matches(pattern)) {
                for (RuleCondition cond : conditions) {
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

        return violations;
    }

    /**
     * Evaluate a VERB_PARTICLE rule.
     * V4.1 implementation - stub for now.
     */
    private List<ViolationDTO> evaluateVerbParticleRule(GrammarRuleV4 rule, List<TokenResult> tokens) {
        // V4.1 implementation - stub for now
        return List.of();
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
        String condType = condition.getConditionType();
        String condValue = condition.getConditionValue();

        return switch (condType) {
            case "HAS_TAG" -> hasTag(token, condValue);
            case "NOT_HAS_TAG" -> !hasTag(token, condValue);
            case "IS_VERB" -> isVerb(token, condValue);
            case "VERB_FORM" -> hasVerbForm(token, condValue);
            case "IS_POS" -> condValue.equals(token.posLevel1());
            case "MATCHES" -> token.surface().matches(condValue);
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
     * Check if token has a specific verb form.
     */
    private boolean hasVerbForm(TokenResult token, String form) {
        return form.equals(token.conjugationForm());
    }
}
