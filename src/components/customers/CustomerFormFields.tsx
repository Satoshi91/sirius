"use client";

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
    email: string;
    phone: string;
    address: string;
    notes: string;
  };
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
    if (onNameChange) {
      onNameChange(path, value);
    }
  };

  // カナの推奨チェック
  const hasKana = formData.name.last.kana && formData.name.first.kana;
  const kanaRecommendation = !hasKana && !readOnly;

  return (
    <div className="space-y-6">
      {/* 姓名フィールド */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-black">氏名（アルファベット）</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name.last.en"
              className="block text-sm font-medium text-black mb-2"
            >
              姓（アルファベット）
            </label>
            {readOnly ? (
              <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
                {formData.name.last.en || "-"}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  id="name.last.en"
                  name="name.last.en"
                  value={formData.name.last.en}
                  onChange={(e) => handleNameChange('name.last.en', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                    fieldErrors['name.last.en']
                      ? "border-red-500"
                      : "border-zinc-200 focus:border-black"
                  }`}
                  placeholder="姓（アルファベット）を入力"
                />
                {fieldErrors['name.last.en'] && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors['name.last.en']}</p>
                )}
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="name.first.en"
              className="block text-sm font-medium text-black mb-2"
            >
              名（アルファベット）
            </label>
            {readOnly ? (
              <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
                {formData.name.first.en || "-"}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  id="name.first.en"
                  name="name.first.en"
                  value={formData.name.first.en}
                  onChange={(e) => handleNameChange('name.first.en', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                    fieldErrors['name.first.en']
                      ? "border-red-500"
                      : "border-zinc-200 focus:border-black"
                  }`}
                  placeholder="名（アルファベット、ミドルネーム含む）を入力"
                />
                {fieldErrors['name.first.en'] && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors['name.first.en']}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">※ミドルネームがある場合は名と一緒に入力してください</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-black">氏名（漢字）</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name.last.ja"
              className="block text-sm font-medium text-black mb-2"
            >
              姓（漢字）
            </label>
            {readOnly ? (
              <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
                {formData.name.last.ja || "-"}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  id="name.last.ja"
                  name="name.last.ja"
                  value={formData.name.last.ja}
                  onChange={(e) => handleNameChange('name.last.ja', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                    fieldErrors['name.last.ja']
                      ? "border-red-500"
                      : "border-zinc-200 focus:border-black"
                  }`}
                  placeholder="姓（漢字）を入力"
                />
                {fieldErrors['name.last.ja'] && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors['name.last.ja']}</p>
                )}
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="name.first.ja"
              className="block text-sm font-medium text-black mb-2"
            >
              名（漢字）
            </label>
            {readOnly ? (
              <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
                {formData.name.first.ja || "-"}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  id="name.first.ja"
                  name="name.first.ja"
                  value={formData.name.first.ja}
                  onChange={(e) => handleNameChange('name.first.ja', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                    fieldErrors['name.first.ja']
                      ? "border-red-500"
                      : "border-zinc-200 focus:border-black"
                  }`}
                  placeholder="名（漢字）を入力"
                />
                {fieldErrors['name.first.ja'] && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors['name.first.ja']}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-black">氏名（カタカナ）</h3>
          {kanaRecommendation && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              推奨
            </span>
          )}
        </div>
        {kanaRecommendation && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
            カタカナの入力が推奨されます（国内実務での利便性のため）
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name.last.kana"
              className="block text-sm font-medium text-black mb-2"
            >
              姓（カタカナ）
            </label>
            {readOnly ? (
              <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
                {formData.name.last.kana || "-"}
              </div>
            ) : (
              <input
                type="text"
                id="name.last.kana"
                name="name.last.kana"
                value={formData.name.last.kana}
                onChange={(e) => handleNameChange('name.last.kana', e.target.value)}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="姓（カタカナ）を入力"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="name.first.kana"
              className="block text-sm font-medium text-black mb-2"
            >
              名（カタカナ）
            </label>
            {readOnly ? (
              <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
                {formData.name.first.kana || "-"}
              </div>
            ) : (
              <input
                type="text"
                id="name.first.kana"
                name="name.first.kana"
                value={formData.name.first.kana}
                onChange={(e) => handleNameChange('name.first.kana', e.target.value)}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="名（カタカナ）を入力"
              />
            )}
          </div>
        </div>
      </div>

      {/* 基本属性 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="nationality"
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
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={onChange}
                className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black ${
                  fieldErrors.nationality
                    ? "border-red-500"
                    : "border-zinc-200 focus:border-black"
                }`}
                placeholder="国籍を入力"
              />
              {fieldErrors.nationality && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.nationality}</p>
              )}
            </>
          )}
        </div>

        <div>
          <label
            htmlFor="birthday"
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
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={onChange}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          )}
        </div>

        <div>
          <label
            htmlFor="gender"
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
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={onChange}
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
      <div>
        <label
          htmlFor="residenceCardNumber"
          className="block text-sm font-medium text-black mb-2"
        >
          在留カード番号
        </label>
        {readOnly ? (
          <div className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-black">
            {formData.residenceCardNumber || "-"}
          </div>
        ) : (
          <input
            type="text"
            id="residenceCardNumber"
            name="residenceCardNumber"
            value={formData.residenceCardNumber}
            onChange={onChange}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="在留カード番号を入力"
          />
        )}
      </div>

      {/* 連絡先 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
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
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="メールアドレスを入力"
            />
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
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
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="電話番号を入力"
            />
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
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
            id="address"
            name="address"
            value={formData.address}
            onChange={onChange}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="住所を入力"
          />
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
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
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={onChange}
            rows={4}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="備考・メモを入力"
          />
        )}
      </div>
    </div>
  );
}
