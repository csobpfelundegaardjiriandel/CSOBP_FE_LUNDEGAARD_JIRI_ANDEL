/**
 * Zde vytvořte formulářové vstupy pomocí react-hook-form, které:
 * 1) Budou součástí formuláře v MainForm, ale zůstanou v odděleném souboru
 * 2) Reference formuláře NEbude získána skrze Prop input (vyvarovat se "Prop drilling")
 * 3) Získá volby (options) pro pole "kategorie" z externího API: https://dummyjson.com/products/categories jako "value" bude "slug", jako "label" bude "name".
 *
 *
 * V tomto souboru budou definovány pole:
 * allocation - number; Bude disabled pokud není amount (z MainForm) vyplněno. Validace na min=0, max=[zadaná hodnota v amount]
 * category - string; Select input s volbami z API (label=name; value=slug)
 * witnesses - FieldArray - dynamické pole kdy lze tlačítkem přidat a odebrat dalšího svědka; Validace minimálně 1 svědek, max 5 svědků
 * witnesses.name - string; Validace required
 * witnesses.email - string; Validace e-mail a asynchronní validace, že email neexistuje na API https://dummyjson.com/users/search?q=[ZADANÝ EMAIL]  - tato validace by měla mít debounce 500ms
 */

import React, { useEffect, useState } from 'react';
import { useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { FormData } from './MainForm';

interface CategoryResponse {
  name: string;
  slug: string;
}

const NestedFields: React.FC = () => {
  const [categories, setCategories] = useState<
    Array<{ label: string; value: string }>
  >([]);

  useEffect(() => {
    fetch('https://dummyjson.com/products/categories')
      .then((response) => response.json())
      .then((data: CategoryResponse[]) =>
        setCategories(
          data.map(({ name, slug }) => ({
            label: name,
            value: slug,
          }))
        )
      );
  }, []);

  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<FormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'witnesses',
  });

  const { register } = control;

  return (
    <div>
      <div>
        <label>Allocation</label>
        <input
          {...register('allocation')}
          type="number"
          disabled={!watch('amount')}
          style={errors.allocation ? { borderColor: 'red' } : {}}
        />
        {errors.allocation && (
          <span style={{ color: 'red' }}>{errors.allocation.message}</span>
        )}
      </div>

      <div>
        <label>Category</label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              style={errors.category ? { borderColor: 'red' } : {}}
            >
              <option value="">Select a category</option>
              {categories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors?.category && (
          <span style={{ color: 'red' }}>{errors.category.message}</span>
        )}
      </div>

      <div>
        <label>Witnesses</label>
        {fields.map((item, index) => (
          <div key={item.id}>
            <input
              {...register(`witnesses.${index}.name`)}
              type="text"
              placeholder="Witness Name"
              style={
                errors.witnesses?.[index]?.name ? { borderColor: 'red' } : {}
              }
            />
            {errors?.witnesses?.[index]?.name && (
              <span style={{ color: 'red' }}>
                {errors.witnesses[index].name.message}
              </span>
            )}

            <input
              {...register(`witnesses.${index}.email`)}
              type="email"
              placeholder="Witness Email"
              style={
                errors?.witnesses?.[index]?.email ? { borderColor: 'red' } : {}
              }
            />
            {errors?.witnesses?.[index]?.email && (
              <span style={{ color: 'red' }}>
                {errors.witnesses[index].email.message}
              </span>
            )}

            <button type="button" onClick={() => remove(index)}>
              Remove Witness
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append({ name: '', email: '' })}>
          Add Witness
        </button>
      </div>
    </div>
  );
};

export default NestedFields;
