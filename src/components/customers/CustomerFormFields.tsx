"use client";

import { HelpCircle } from "lucide-react";
import ResidenceCardNumberInput from "./ResidenceCardNumberInput";
import { Tooltip } from "@/components/ui/tooltip";

interface CustomerFormFieldsProps {
  formData: {
    name: {
      last: { en: string; ja: string; kana: string };
      first: { en: string; ja: string; kana: string };
    };
    nationality: string;
    birthday: string;
    gender: string;
    residenceCardNumber: string;
    expiryDate: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  };
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onNameChange?: (path: string, value: string) => void;
  fieldErrors?: Record<string, string>;
  readOnly?: boolean;
}

export default function CustomerFormFields({
  formData,
  onChange,
  onNameChange,
  fieldErrors = {},
  readOnly = false,
}: CustomerFormFieldsProps) {
  const handleNameChange = (path: string, value: string) => {
    console.log("[CustomerFormFields] handleNameChange called:", {
      path,
      value,
      hasOnNameChange: !!onNameChange,
    });
    if (onNameChange) {
      onNameChange(path, value);
    } else {
      console.warn("[CustomerFormFields] onNameChange is not provided!");
    }
  };

  // カナの推奨チェック
  const hasKana = formData.name.last.kana && formData.name.first.kana;
  const kanaRecommendation = !hasKana && !readOnly;

  return (
    <div className="space-y-6">
      {/* 姓名フィールド - テーブル形式 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-black">氏名入力</h3>
          {kanaRecommendation && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              カタカナ推奨
            </span>
          )}
        </div>
        {kanaRecommendation && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
            カタカナの入力が推奨されます（国内実務での利便性のため）
          </p>
        )}

        {/* デスクトップ表示：テーブル形式 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="w-32 px-4 py-3 text-left text-sm font-semibold text-black bg-zinc-50"></th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black bg-zinc-50">
                  姓
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black bg-zinc-50">
                  名
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 英字行 */}
              <tr className="border-b border-zinc-200">
                <td className="px-4 py-3 text-sm font-medium text-black bg-zinc-50">
                  英字
                </td>
                <td className="px-4 py-3">
                  {readOnly ? (
                    <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                      {formData.name.last.en || "-"}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        id="name-last-en-99x"
                        name="name.last.en"
                        value={formData.name.last.en}
                        onChange={(e) => {
                          console.log(
                            "[CustomerFormFields] name.last.en onChange:",
                            { value: e.target.value }
                          );
                          handleNameChange("name.last.en", e.target.value);
                        }}
                        autoComplete="off"
                        className={`w-full px-3 py-2 border rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                          fieldErrors["name.last.en"]
                            ? "border-red-500"
                            : "border-zinc-200 focus:border-black"
                        }`}
                        placeholder="姓（アルファベット）"
                      />
                      {fieldErrors["name.last.en"] && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldErrors["name.last.en"]}
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {readOnly ? (
                    <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                      {formData.name.first.en || "-"}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          id="name-first-en-99x"
                          name="name.first.en"
                          value={formData.name.first.en}
                          onChange={(e) =>
                            handleNameChange("name.first.en", e.target.value)
                          }
                          autoComplete="off"
                          className={`flex-1 px-3 py-2 border rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                            fieldErrors["name.first.en"]
                              ? "border-red-500"
                              : "border-zinc-200 focus:border-black"
                          }`}
                          placeholder="名（アルファベット、ミドルネーム含む）"
                        />
                        <Tooltip
                          content="ミドルネームがある場合は名と一緒に入力してください"
                          side="top"
                        >
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                        </Tooltip>
                      </div>
                      {fieldErrors["name.first.en"] && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldErrors["name.first.en"]}
                        </p>
                      )}
                    </div>
                  )}
                </td>
              </tr>

              {/* 漢字行 */}
              <tr className="border-b border-zinc-200">
                <td className="px-4 py-3 text-sm font-medium text-black bg-zinc-50">
                  漢字
                </td>
                <td className="px-4 py-3">
                  {readOnly ? (
                    <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                      {formData.name.last.ja || "-"}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        id="name-last-ja-99x"
                        name="name.last.ja"
                        value={formData.name.last.ja}
                        onChange={(e) =>
                          handleNameChange("name.last.ja", e.target.value)
                        }
                        autoComplete="off"
                        className={`w-full px-3 py-2 border rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                          fieldErrors["name.last.ja"]
                            ? "border-red-500"
                            : "border-zinc-200 focus:border-black"
                        }`}
                        placeholder="姓（漢字）"
                      />
                      {fieldErrors["name.last.ja"] && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldErrors["name.last.ja"]}
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {readOnly ? (
                    <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                      {formData.name.first.ja || "-"}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        id="name-first-ja-99x"
                        name="name.first.ja"
                        value={formData.name.first.ja}
                        onChange={(e) =>
                          handleNameChange("name.first.ja", e.target.value)
                        }
                        autoComplete="off"
                        className={`w-full px-3 py-2 border rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                          fieldErrors["name.first.ja"]
                            ? "border-red-500"
                            : "border-zinc-200 focus:border-black"
                        }`}
                        placeholder="名（漢字）"
                      />
                      {fieldErrors["name.first.ja"] && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldErrors["name.first.ja"]}
                        </p>
                      )}
                    </div>
                  )}
                </td>
              </tr>

              {/* カタカナ行 */}
              <tr className="border-b border-zinc-200">
                <td className="px-4 py-3 text-sm font-medium text-black bg-zinc-50">
                  カタカナ
                </td>
                <td className="px-4 py-3">
                  {readOnly ? (
                    <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                      {formData.name.last.kana || "-"}
                    </div>
                  ) : (
                    <input
                      type="text"
                      id="name-last-kana-99x"
                      name="name.last.kana"
                      value={formData.name.last.kana}
                      onChange={(e) =>
                        handleNameChange("name.last.kana", e.target.value)
                      }
                      autoComplete="off"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="姓（カタカナ）"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {readOnly ? (
                    <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                      {formData.name.first.kana || "-"}
                    </div>
                  ) : (
                    <input
                      type="text"
                      id="name-first-kana-99x"
                      name="name.first.kana"
                      value={formData.name.first.kana}
                      onChange={(e) =>
                        handleNameChange("name.first.kana", e.target.value)
                      }
                      autoComplete="off"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="名（カタカナ）"
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* モバイル表示：縦並びカード形式 */}
        <div className="md:hidden space-y-4">
          <div className="border border-zinc-200 rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-semibold text-black mb-3">英字</h4>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="name-last-en-mobile-99x"
                  className="block text-xs font-medium text-black mb-1"
                >
                  姓（アルファベット）
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                    {formData.name.last.en || "-"}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      id="name-last-en-mobile-99x"
                      name="name.last.en"
                      value={formData.name.last.en}
                      onChange={(e) => {
                        console.log(
                          "[CustomerFormFields] name.last.en onChange:",
                          { value: e.target.value }
                        );
                        handleNameChange("name.last.en", e.target.value);
                      }}
                      autoComplete="off"
                      className={`w-full px-3 py-2 border rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                        fieldErrors["name.last.en"]
                          ? "border-red-500"
                          : "border-zinc-200 focus:border-black"
                      }`}
                      placeholder="姓（アルファベット）"
                    />
                    {fieldErrors["name.last.en"] && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors["name.last.en"]}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label
                    htmlFor="name-first-en-mobile-99x"
                    className="text-xs font-medium text-black"
                  >
                    名（アルファベット）
                  </label>
                  <Tooltip
                    content="ミドルネームがある場合は名と一緒に入力してください"
                    side="top"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                  </Tooltip>
                </div>
                {readOnly ? (
                  <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                    {formData.name.first.en || "-"}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      id="name-first-en-mobile-99x"
                      name="name.first.en"
                      value={formData.name.first.en}
                      onChange={(e) =>
                        handleNameChange("name.first.en", e.target.value)
                      }
                      autoComplete="off"
                      className={`w-full px-3 py-2 border rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                        fieldErrors["name.first.en"]
                          ? "border-red-500"
                          : "border-zinc-200 focus:border-black"
                      }`}
                      placeholder="名（アルファベット、ミドルネーム含む）"
                    />
                    {fieldErrors["name.first.en"] && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors["name.first.en"]}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border border-zinc-200 rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-semibold text-black mb-3">漢字</h4>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="name-last-ja-mobile-99x"
                  className="block text-xs font-medium text-black mb-1"
                >
                  姓（漢字）
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                    {formData.name.last.ja || "-"}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      id="name-last-ja-mobile-99x"
                      name="name.last.ja"
                      value={formData.name.last.ja}
                      onChange={(e) =>
                        handleNameChange("name.last.ja", e.target.value)
                      }
                      autoComplete="off"
                      className={`w-full px-3 py-2 border rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                        fieldErrors["name.last.ja"]
                          ? "border-red-500"
                          : "border-zinc-200 focus:border-black"
                      }`}
                      placeholder="姓（漢字）"
                    />
                    {fieldErrors["name.last.ja"] && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors["name.last.ja"]}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div>
                <label
                  htmlFor="name-first-ja-mobile-99x"
                  className="block text-xs font-medium text-black mb-1"
                >
                  名（漢字）
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                    {formData.name.first.ja || "-"}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      id="name-first-ja-mobile-99x"
                      name="name.first.ja"
                      value={formData.name.first.ja}
                      onChange={(e) =>
                        handleNameChange("name.first.ja", e.target.value)
                      }
                      autoComplete="off"
                      className={`w-full px-3 py-2 border rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                        fieldErrors["name.first.ja"]
                          ? "border-red-500"
                          : "border-zinc-200 focus:border-black"
                      }`}
                      placeholder="名（漢字）"
                    />
                    {fieldErrors["name.first.ja"] && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors["name.first.ja"]}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border border-zinc-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-black">カタカナ</h4>
              {kanaRecommendation && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  推奨
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="name-last-kana-mobile-99x"
                  className="block text-xs font-medium text-black mb-1"
                >
                  姓（カタカナ）
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                    {formData.name.last.kana || "-"}
                  </div>
                ) : (
                  <input
                    type="text"
                    id="name-last-kana-mobile-99x"
                    name="name.last.kana"
                    value={formData.name.last.kana}
                    onChange={(e) =>
                      handleNameChange("name.last.kana", e.target.value)
                    }
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="姓（カタカナ）"
                  />
                )}
              </div>
              <div>
                <label
                  htmlFor="name-first-kana-mobile-99x"
                  className="block text-xs font-medium text-black mb-1"
                >
                  名（カタカナ）
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black text-sm">
                    {formData.name.first.kana || "-"}
                  </div>
                ) : (
                  <input
                    type="text"
                    id="name-first-kana-mobile-99x"
                    name="name.first.kana"
                    value={formData.name.first.kana}
                    onChange={(e) =>
                      handleNameChange("name.first.kana", e.target.value)
                    }
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="名（カタカナ）"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 基本属性 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="kokuseki-99x"
            className="block text-sm font-medium text-black mb-2"
          >
            国籍 <span className="text-red-500">*</span>
          </label>
          {readOnly ? (
            <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
              {formData.nationality || "-"}
            </div>
          ) : (
            <>
              <input
                type="text"
                id="kokuseki-99x"
                name="nationality"
                value={formData.nationality}
                onChange={(e) => {
                  console.log("[CustomerFormFields] nationality onChange:", {
                    value: e.target.value,
                    hasOnChange: !!onChange,
                  });
                  if (onChange) {
                    onChange(e);
                  } else {
                    console.warn(
                      "[CustomerFormFields] onChange is not provided for nationality!"
                    );
                  }
                }}
                autoComplete="off"
                className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                  fieldErrors.nationality
                    ? "border-red-500"
                    : "border-zinc-200 focus:border-black"
                }`}
                placeholder="国籍を入力"
              />
              {fieldErrors.nationality && (
                <p className="mt-1 text-sm text-red-500">
                  {fieldErrors.nationality}
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label
            htmlFor="tanjo-99x"
            className="block text-sm font-medium text-black mb-2"
          >
            生年月日
          </label>
          {readOnly ? (
            <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
              {formData.birthday || "-"}
            </div>
          ) : (
            <input
              type="date"
              id="tanjo-99x"
              name="birthday"
              value={formData.birthday}
              onChange={onChange}
              autoComplete="off"
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          )}
        </div>

        <div>
          <label
            htmlFor="seibetsu-99x"
            className="block text-sm font-medium text-black mb-2"
          >
            性別
          </label>
          {readOnly ? (
            <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
              {formData.gender || "-"}
            </div>
          ) : (
            <select
              id="seibetsu-99x"
              name="gender"
              value={formData.gender}
              onChange={onChange}
              autoComplete="off"
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">選択してください</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          )}
        </div>
      </div>

      {/* 在留カード情報 */}
      <div className="space-y-4">
        {readOnly ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="zairyu-no-99x"
                className="block text-sm font-medium text-black mb-2"
              >
                在留カード番号
              </label>
              <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
                {formData.residenceCardNumber || "-"}
              </div>
            </div>
            <div>
              <label
                htmlFor="expiryDate"
                className="block text-sm font-medium text-black mb-2"
              >
                在留期限
              </label>
              <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
                {formData.expiryDate || "-"}
              </div>
            </div>
          </div>
        ) : (
          <>
            <ResidenceCardNumberInput
              value={formData.residenceCardNumber}
              onChange={(value) => {
                if (onChange) {
                  // 既存のonChangeハンドラーとの互換性のため、合成イベントをシミュレート
                  const syntheticEvent = {
                    target: {
                      name: "residenceCardNumber",
                      value: value,
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange(syntheticEvent);
                }
              }}
              error={fieldErrors.residenceCardNumber}
              disabled={readOnly}
            />
            <div>
              <label
                htmlFor="expiryDate"
                className="block text-sm font-medium text-black mb-2"
              >
                在留期限
              </label>
              <input
                type="date"
                id="kigen-99x"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={onChange}
                autoComplete="off"
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
          </>
        )}
      </div>

      {/* 連絡先 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="mail-99x"
            className="block text-sm font-medium text-black mb-2"
          >
            メールアドレス
          </label>
          {readOnly ? (
            <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
              {formData.email || "-"}
            </div>
          ) : (
            <input
              type="email"
              id="mail-99x"
              name="email"
              value={formData.email}
              onChange={onChange}
              autoComplete="off"
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="メールアドレスを入力"
            />
          )}
        </div>

        <div>
          <label
            htmlFor="denwa-99x"
            className="block text-sm font-medium text-black mb-2"
          >
            電話番号
          </label>
          {readOnly ? (
            <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
              {formData.phone || "-"}
            </div>
          ) : (
            <input
              type="tel"
              id="denwa-99x"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              autoComplete="off"
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="電話番号を入力"
            />
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="jusho-99x"
          className="block text-sm font-medium text-black mb-2"
        >
          住所
        </label>
        {readOnly ? (
          <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
            {formData.address || "-"}
          </div>
        ) : (
          <input
            type="text"
            id="jusho-99x"
            name="address"
            value={formData.address}
            onChange={onChange}
            autoComplete="off"
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="住所を入力"
          />
        )}
      </div>

      <div>
        <label
          htmlFor="biko-99x"
          className="block text-sm font-medium text-black mb-2"
        >
          備考・メモ
        </label>
        {readOnly ? (
          <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black min-h-[100px]">
            {formData.notes || "-"}
          </div>
        ) : (
          <textarea
            id="biko-99x"
            name="notes"
            value={formData.notes}
            onChange={onChange}
            rows={4}
            autoComplete="off"
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="備考・メモを入力"
          />
        )}
      </div>
    </div>
  );
}
