/**
 * Zde vytvořte formulář pomocí knihovny react-hook-form.
 * Formulář by měl splňovat:
 * 1) být validován yup schématem
 * 2) formulář obsahovat pole "NestedFields" z jiného souboru
 * 3) být plně TS typovaný
 * 4) nevalidní vstupy červeně označit (background/outline/border) a zobrazit u nich chybové hlášky
 * 5) nastavte výchozí hodnoty objektem initalValues
 * 6) mít "Submit" tlačítko, po jeho stisku se vylogují data z formuláře:  "console.log(formData)"
 *
 * V tomto souboru budou definovány pole:
 * amount - number; Validace min=0, max=300
 * damagedParts - string[] formou multi-checkboxu s volbami "roof", "front", "side", "rear"
 * vykresleny pole z form/NestedFields
 */

// příklad očekávaného výstupního JSON, předvyplňte tímto objektem formulář
const initialValues = {
  amount: 250,
  allocation: 140,
  damagedParts: ['side', 'rear'],
  category: 'kitchen-accessories',
  witnesses: [
    {
      name: 'Marek',
      email: 'marek@email.cz',
    },
    {
      name: 'Emily',
      email: 'emily.johnson@x.dummyjson.com',
    },
  ],
};

const damagedPartsOptions = ['roof', 'front', 'side', 'rear'];

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import NestedFields from './NestedFields';
import debounce from 'lodash.debounce';

export interface FormData {
  amount: number;
  damagedParts: string[];
  allocation: number;
  category: string;
  witnesses: { name: string; email: string }[];
}

const validateEmailAsync = debounce(async (email: string) => {
  try {
    const data = await (
      await fetch(`https://dummyjson.com/users/search?q=${email}`)
    ).json();

    if (data.total > 0) {
      return 'Email already exists';
    }
  } catch (error) {
    console.error('Failed to validate email:', error);
    return 'Validation error, please try again';
  }

  return true;
}, 500);

const schema = yup.object().shape({
  amount: yup.number().required('Amount is required').min(0).max(300),
  damagedParts: yup
    .array()
    .min(1, 'Please select at least one damaged part.')
    .required(),
  allocation: yup.number().min(0),
  category: yup.string().required('Category is required'),
  witnesses: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Name is required'),
        email: yup
          .string()
          .email('Invalid email')
          .required('Email is required')
          .test({
            name: 'check-email-exists',
            message: 'Email already exists',
            test: async function (value) {
              if (!value) return false;

              return (await validateEmailAsync(value)) === true;
            },
          }),
      })
    )
    .min(1, 'At least one witness is required')
    .max(5, 'No more than 5 witnesses allowed'),
});

const MainForm: React.FC = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit((data) => {
          console.log(data);
        })}
      >
        <div>
          <label>Amount</label>
          <input
            type="number"
            {...register('amount')}
            style={errors.amount ? { borderColor: 'red' } : {}}
          />
          {errors.amount && (
            <span style={{ color: 'red' }}>{errors.amount.message}</span>
          )}
        </div>

        <div>
          <label>Damaged Parts</label>
          {damagedPartsOptions.map((part) => (
            <div key={part}>
              <label>{part}</label>
              <input
                type="checkbox"
                value={part}
                {...register('damagedParts')}
              />
            </div>
          ))}
          {errors.damagedParts && (
            <span style={{ color: 'red' }}>{errors.damagedParts.message}</span>
          )}
        </div>

        <NestedFields />

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

export default MainForm;
