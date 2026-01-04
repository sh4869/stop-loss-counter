import { useState, useEffect, useRef } from "react";
import "./App.css";

export interface AppSettings {
  stepValue: number;
  historyLimit: number;
}

type AlertRule = Consecutive;

type Consecutive = {
  id: string;
  count: number;
  type: boolean;
};

type Percentage = {
  id: string;
  type: boolean;
};

interface SettingsProps {
  onBack: () => void;
}

const Settings = ({ onBack }: SettingsProps) => {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);

  useEffect(() => {
    const alerts = window.localStorage.getItem("alert_rule_consecutive");
    if (alerts) {
      setAlerts(JSON.parse(alerts) as AlertRule[]);
    }
  }, []);

  const addConsecutiveAlert = () => {
    const newAlert: Consecutive = {
      id: Date.now().toString(),
      count: 3,
      type: false,
    };
    setAlerts([...alerts, newAlert]);
  };

  const updateConsecutiveAlert = (id: string, count: number, type: boolean) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, count, type } : alert,
      ),
    );
  };

  const deleteConsecutiveAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const onSettingsChange = (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  };

  const onBackButtonClicked = () => {
    onSettingsChange("alert_rule_consecutive", JSON.stringify(alerts));
    onBack();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">設定</h1>
          <button
            onClick={onBackButtonClicked}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
          >
            戻る
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              カウントステップ
            </label>
            <p className="text-sm text-gray-500 mb-3">
              ボタンを1回押したときに増減する数値
            </p>
            <input
              type="number"
              min="1"
              max="100"
              onChange={(e) =>
                onSettingsChange(
                  "stepValue",
                  JSON.stringify(parseInt(e.target.value) || 1),
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              履歴保存件数
            </label>
            <p className="text-sm text-gray-500 mb-3">保存する履歴の最大件数</p>
            <input
              type="number"
              min="1"
              max="50"
              onChange={(e) =>
                onSettingsChange(
                  "historyLimit",
                  JSON.stringify(parseInt(e.target.value) || 5),
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">
                  連続アラート
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  連続してn回-1/+1したときにアラートを表示
                </p>
              </div>
              <button
                onClick={addConsecutiveAlert}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
              >
                + 追加
              </button>
            </div>

            {alerts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                アラートが設定されていません
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm text-gray-700">連続</span>
                      <select
                        value={alert.type ? "+" : "-"}
                        onChange={(e) =>
                          updateConsecutiveAlert(
                            alert.id,
                            alert.count,
                            e.target.value == "+",
                          )
                        }
                        className="px-3 py-1 border border-gray-300 rounded"
                      >
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={alert.count}
                        onChange={(e) =>
                          updateConsecutiveAlert(
                            alert.id,
                            parseInt(e.target.value) || 1,
                            alert.type,
                          )
                        }
                        className="w-20 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                      <span className="text-sm text-gray-700">回</span>
                    </div>
                    <button
                      onClick={() => deleteConsecutiveAlert(alert.id)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded transition-colors"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              現在の設定値は自動的に保存されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [count, setCount] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<boolean>(false);
  const [consecutiveAlertRule, setConsecutiveAlertRule] = useState<AlertRule[]>(
    [],
  );
  const [mode, setMode] = useState<"app" | "setting">("app");

  // 初期ロード
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const countResult = window.localStorage.getItem("counter-value");
      const historyResult = window.localStorage.getItem("counter-history");
      const consecutiveAlertRule = window.localStorage.getItem(
        "alert_rule_consecutive",
      );

      if (consecutiveAlertRule) {
        setConsecutiveAlertRule(JSON.parse(consecutiveAlertRule));
      }

      if (countResult) {
        setCount(JSON.parse(countResult));
      }
      if (historyResult) {
        setHistory(JSON.parse(historyResult));
      }
    } catch (error) {
      console.log("データの読み込み中にエラーが発生しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (
    newCount: number,
    newHistory: string[],
  ): Promise<void> => {
    const alerts = consecutiveAlertRule.filter((rule) => {
      return (
        newHistory.length >= rule.count &&
        newHistory.slice(0, rule.count).every((value) => {
          return rule.type ? value === "+1" : value === "-1";
        })
      );
    });
    if (alerts.length > 0) {
      setAlert(true);
    }
    try {
      window.localStorage.setItem("counter-value", JSON.stringify(newCount));
      window.localStorage.setItem(
        "counter-history",
        JSON.stringify(newHistory),
      );
    } catch (error) {
      console.error("データの保存中にエラーが発生しました:", error);
    }
  };

  const handleIncrement = (): void => {
    const newCount = count + 1;
    const newHistory = ["+1", ...history].slice(0, 5);
    setCount(newCount);
    setHistory(newHistory);
    saveData(newCount, newHistory);
  };

  const handleDecrement = (): void => {
    const newCount = count - 1;
    const newHistory = ["-1", ...history].slice(0, 5);
    setCount(newCount);
    setHistory(newHistory);
    saveData(newCount, newHistory);
  };

  const handleClear = async (): Promise<void> => {
    try {
      window.localStorage.removeItem("counter-value");
      window.localStorage.removeItem("counter-history");
      setAlert(false);
      setCount(0);
      setHistory([]);
    } catch (error) {
      console.error("データの削除中にエラーが発生しました:", error);
    }
  };

  const onOpenSetting = () => {
    setMode("setting");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (mode === "setting") {
    return (
      <Settings
        onBack={() => {
          setMode("app");
        }}
      />
    );
  }

  const app = (
    <div className="rounded-lg shadow-lg p-8 w-full max-w-md">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">カウンター</h1>
        <button
          onClick={onOpenSetting}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          設定
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 mb-8">
        <button
          onClick={handleDecrement}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white text-3xl font-bold rounded-full transition-colors"
        >
          -
        </button>

        <div className="text-6xl font-bold text-gray-800 w-32 text-center">
          {count}
        </div>

        <button
          onClick={handleIncrement}
          className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white text-3xl font-bold rounded-full transition-colors"
        >
          +
        </button>
      </div>

      {history.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              履歴（最新件）
            </h2>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded transition-colors"
            >
              履歴をクリア
            </button>
          </div>

          <ul className="space-y-2">
            {history.map((item, index) => (
              <li
                key={index}
                className="px-4 py-2rounded text-gray-700 flex items-center"
              >
                <span className="font-mono text-lg">
                  {item.startsWith("+") ? (
                    <span className="text-blue-600">{item}</span>
                  ) : (
                    <span className="text-red-600">{item}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <>
      {alert ? (
        <div className="min-h-screen flex items-center justify-center bg-red-100 p-4">
          {app}
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          {app}
        </div>
      )}
    </>
  );
};

export default App;
