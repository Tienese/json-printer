import { useEffect, useState } from 'react';
import { useGrammarRules, type GrammarRuleV4, type RuleCondition, type RuleTestSentence } from '../hooks/useGrammarRules';

interface GrammarRulesPageProps {
    onNavigate: (route: string) => void;
}

/**
 * Grammar Rules Page - V4.0 minimal implementation
 * Lists rules with conditions and test sentences.
 */
export function GrammarRulesPage({ onNavigate }: GrammarRulesPageProps) {
    const {
        rules, loading, error, fetchAll, create, remove,
        getConditions, addCondition, removeCondition,
        getTestSentences, addTestSentence, removeTestSentence, validateTests
    } = useGrammarRules();

    const [selectedRule, setSelectedRule] = useState<GrammarRuleV4 | null>(null);
    const [conditions, setConditions] = useState<RuleCondition[]>([]);
    const [testSentences, setTestSentences] = useState<RuleTestSentence[]>([]);

    // New rule form
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('PARTICLE');
    const [newParticle, setNewParticle] = useState('');
    const [newPattern, setNewPattern] = useState('');
    const [newDescription, setNewDescription] = useState('');

    // New condition form
    const [condPosition, setCondPosition] = useState('BEFORE');
    const [condType, setCondType] = useState('HAS_TAG');
    const [condValue, setCondValue] = useState('');
    const [condError, setCondError] = useState('');

    // New test form
    const [testText, setTestText] = useState('');
    const [testExpected, setTestExpected] = useState('PASS');

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleSelectRule = async (rule: GrammarRuleV4) => {
        setSelectedRule(rule);
        const conds = await getConditions(rule.id);
        setConditions(conds);
        const tests = await getTestSentences(rule.id);
        setTestSentences(tests);
    };

    const handleCreateRule = async () => {
        if (!newName.trim()) return;
        const result = await create({
            name: newName.trim(),
            ruleType: newType,
            particle: newType === 'PARTICLE' ? newParticle : undefined,
            pattern: newType === 'PATTERN' ? newPattern : undefined,
            description: newDescription,
        });
        if (result) {
            setNewName('');
            setNewParticle('');
            setNewPattern('');
            setNewDescription('');
            fetchAll();
        }
    };

    const handleAddCondition = async () => {
        if (!selectedRule || !condValue.trim()) return;
        const result = await addCondition(selectedRule.id, {
            targetPosition: condPosition,
            conditionType: condType,
            conditionValue: condValue.trim(),
            errorMessage: condError.trim() || `{word} violates ${condType}: ${condValue}`,
            isRequired: true,
        });
        if (result) {
            setCondValue('');
            setCondError('');
            const conds = await getConditions(selectedRule.id);
            setConditions(conds);
        }
    };

    const handleAddTest = async () => {
        if (!selectedRule || !testText.trim()) return;
        const result = await addTestSentence(selectedRule.id, {
            text: testText.trim(),
            expectedResult: testExpected,
        });
        if (result) {
            setTestText('');
            const tests = await getTestSentences(selectedRule.id);
            setTestSentences(tests);
        }
    };

    const handleValidateTests = async () => {
        if (!selectedRule) return;
        const results = await validateTests(selectedRule.id);
        setTestSentences(results);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => onNavigate('')}
                        className="text-blue-600 hover:underline text-sm mb-2"
                    >
                        ← Back to Home
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Grammar Rules V4</h1>
                    <p className="text-gray-500">Manage validation rules and conditions</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Rules List */}
                    <div>
                        {/* Add Rule */}
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <h2 className="font-semibold mb-2">Add Rule</h2>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Rule name..."
                                    className="w-full px-3 py-2 border rounded"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value)}
                                        className="px-3 py-2 border rounded"
                                    >
                                        <option value="PARTICLE">PARTICLE</option>
                                        <option value="PATTERN">PATTERN</option>
                                    </select>
                                    {newType === 'PARTICLE' && (
                                        <input
                                            type="text"
                                            value={newParticle}
                                            onChange={(e) => setNewParticle(e.target.value)}
                                            placeholder="Particle (e.g., を)"
                                            className="flex-1 px-3 py-2 border rounded"
                                        />
                                    )}
                                    {newType === 'PATTERN' && (
                                        <input
                                            type="text"
                                            value={newPattern}
                                            onChange={(e) => setNewPattern(e.target.value)}
                                            placeholder="Pattern (regex)"
                                            className="flex-1 px-3 py-2 border rounded"
                                        />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Description..."
                                    className="w-full px-3 py-2 border rounded"
                                />
                                <button
                                    onClick={handleCreateRule}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Create Rule
                                </button>
                            </div>
                        </div>

                        {/* Rules List */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 border-b">
                                <h2 className="font-semibold">Rules ({rules.length})</h2>
                            </div>
                            {loading && <div className="p-4 text-gray-500">Loading...</div>}
                            {error && <div className="p-4 text-red-600">{error}</div>}
                            <div className="divide-y max-h-96 overflow-auto">
                                {rules.map((rule) => (
                                    <div
                                        key={rule.id}
                                        onClick={() => handleSelectRule(rule)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedRule?.id === rule.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="font-medium">{rule.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {rule.ruleType} {rule.particle && `• ${rule.particle}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Rule Details */}
                    <div>
                        {selectedRule ? (
                            <>
                                {/* Rule Info */}
                                <div className="bg-white rounded-lg shadow p-4 mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold">{selectedRule.name}</h2>
                                            <p className="text-gray-500">
                                                {selectedRule.ruleType}
                                                {selectedRule.particle && ` • Particle: ${selectedRule.particle}`}
                                                {selectedRule.pattern && ` • Pattern: ${selectedRule.pattern}`}
                                            </p>
                                            {selectedRule.description && (
                                                <p className="mt-2 text-gray-600">{selectedRule.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => { remove(selectedRule.id); setSelectedRule(null); fetchAll(); }}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Conditions */}
                                <div className="bg-white rounded-lg shadow p-4 mb-4">
                                    <h3 className="font-semibold mb-2">Conditions</h3>
                                    <div className="space-y-2 mb-4">
                                        {conditions.map((cond) => (
                                            <div key={cond.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div>
                                                    <span className="font-medium">{cond.targetPosition}</span>
                                                    <span className="mx-2">→</span>
                                                    <span>{cond.conditionType}: {cond.conditionValue}</span>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        await removeCondition(selectedRule.id, cond.id);
                                                        const conds = await getConditions(selectedRule.id);
                                                        setConditions(conds);
                                                    }}
                                                    className="text-red-600 text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {conditions.length === 0 && (
                                            <p className="text-gray-500 text-sm">No conditions</p>
                                        )}
                                    </div>
                                    {/* Add Condition */}
                                    <div className="flex gap-2 flex-wrap">
                                        <select
                                            value={condPosition}
                                            onChange={(e) => setCondPosition(e.target.value)}
                                            className="px-2 py-1 border rounded text-sm"
                                        >
                                            <option value="BEFORE">BEFORE</option>
                                            <option value="AFTER">AFTER</option>
                                            <option value="OBJECT">OBJECT</option>
                                            <option value="VERB">VERB</option>
                                        </select>
                                        <select
                                            value={condType}
                                            onChange={(e) => setCondType(e.target.value)}
                                            className="px-2 py-1 border rounded text-sm"
                                        >
                                            <option value="HAS_TAG">HAS_TAG</option>
                                            <option value="NOT_HAS_TAG">NOT_HAS_TAG</option>
                                            <option value="IS_POS">IS_POS</option>
                                            <option value="MATCHES">MATCHES</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={condValue}
                                            onChange={(e) => setCondValue(e.target.value)}
                                            placeholder="Value..."
                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                        />
                                        <button
                                            onClick={handleAddCondition}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Test Sentences */}
                                <div className="bg-white rounded-lg shadow p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">Test Sentences</h3>
                                        <button
                                            onClick={handleValidateTests}
                                            className="text-sm px-3 py-1 bg-gray-800 text-white rounded"
                                        >
                                            Validate Tests
                                        </button>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {testSentences.map((test) => (
                                            <div key={test.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div>
                                                    <span className="font-mono">{test.text}</span>
                                                    <span className="ml-2 text-sm">
                                                        expect: {test.expectedResult}
                                                        {test.actualResult && (
                                                            <span className={test.resultMatches ? 'text-green-600' : 'text-red-600'}>
                                                                {' '}→ {test.actualResult} {test.resultMatches ? '✓' : '✗'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        await removeTestSentence(selectedRule.id, test.id);
                                                        const tests = await getTestSentences(selectedRule.id);
                                                        setTestSentences(tests);
                                                    }}
                                                    className="text-red-600 text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {testSentences.length === 0 && (
                                            <p className="text-gray-500 text-sm">No test sentences</p>
                                        )}
                                    </div>
                                    {/* Add Test */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={testText}
                                            onChange={(e) => setTestText(e.target.value)}
                                            placeholder="Test sentence..."
                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                        />
                                        <select
                                            value={testExpected}
                                            onChange={(e) => setTestExpected(e.target.value)}
                                            className="px-2 py-1 border rounded text-sm"
                                        >
                                            <option value="PASS">PASS</option>
                                            <option value="FAIL">FAIL</option>
                                        </select>
                                        <button
                                            onClick={handleAddTest}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                                Select a rule to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
