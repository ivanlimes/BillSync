import { useEffect, useState, type FormEvent } from 'react';
import {
  appActions,
  selectEditingState,
  selectSelectedBill,
  selectSelectedPayment,
  useAppDispatch,
  useAppStore,
} from '@/store';
import type { PaymentRecord, PaymentType } from '@/domain';
import { Button, Panel } from '@/ui/primitives';
import { createId } from '@/editing/utils/createId';
import {
  defaultPaymentFormValues,
  getPaymentFormValues,
  validatePaymentForm,
  type PaymentFormValues,
} from '@/editing/forms/paymentForm';

const paymentTypeOptions: PaymentType[] = ['manual', 'autopay', 'refund', 'adjustment'];

export function PaymentEditorPanel() {
  const editingState = useAppStore(selectEditingState);
  const selectedBill = useAppStore(selectSelectedBill);
  const selectedPayment = useAppStore(selectSelectedPayment);
  const dispatch = useAppDispatch();

  const [values, setValues] = useState<PaymentFormValues>(() =>
    editingState.kind === 'payment-edit'
      ? getPaymentFormValues(selectedPayment)
      : defaultPaymentFormValues,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormValues, string>>>({});

  useEffect(() => {
    setValues(
      editingState.kind === 'payment-edit'
        ? getPaymentFormValues(selectedPayment)
        : defaultPaymentFormValues,
    );
    setErrors({});
  }, [editingState.kind, selectedPayment]);

  if (editingState.kind !== 'payment-create' && editingState.kind !== 'payment-edit') {
    return null;
  }

  if (selectedBill === null) {
    return null;
  }

  const activeBill = selectedBill;
  const isEditing = editingState.kind === 'payment-edit' && selectedPayment !== null;

  function updateValue<TKey extends keyof PaymentFormValues>(key: TKey, nextValue: PaymentFormValues[TKey]) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  function handleCancel() {
    dispatch(appActions.closeEditor());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validatePaymentForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const normalized: Omit<PaymentRecord, 'id'> = {
      billId: activeBill.id,
      amount: Number(values.amount),
      paymentDate: values.paymentDate,
      paymentType: values.paymentType,
      notes: values.notes.trim() === '' ? undefined : values.notes.trim(),
    };

    if (isEditing && selectedPayment) {
      dispatch(appActions.updatePayment(selectedPayment.id, normalized));
      dispatch(appActions.selectPayment(selectedPayment.id));
    } else {
      const newPaymentId = createId('payment');
      dispatch(
        appActions.addPayment({
          id: newPaymentId,
          ...normalized,
        }),
      );
      dispatch(appActions.selectPayment(newPaymentId));
    }

    dispatch(appActions.closeEditor());
  }

  return (
    <Panel className="editor-panel" tone="surface" padding="lg">
      <div className="editor-panel__header">
        <div>
          <h3>{isEditing ? 'Edit Payment' : 'Add Payment'}</h3>
          <p className="editor-panel__caption">
            Payment records stay attached to the selected bill. Derived paid totals refresh after save.
          </p>
        </div>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="editor-form__grid editor-form__grid--two-column">
          <label className="editor-field">
            <span className="editor-field__label">Bill</span>
            <input className="editor-input" value={activeBill.name} readOnly />
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Payment type</span>
            <select
              className="editor-input"
              value={values.paymentType}
              onChange={(event) => updateValue('paymentType', event.target.value as PaymentType)}
            >
              {paymentTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Amount</span>
            <input
              className="editor-input"
              inputMode="decimal"
              value={values.amount}
              onChange={(event) => updateValue('amount', event.target.value)}
            />
            {errors.amount ? <span className="editor-field__error">{errors.amount}</span> : null}
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Payment date</span>
            <input
              className="editor-input"
              type="date"
              value={values.paymentDate}
              onChange={(event) => updateValue('paymentDate', event.target.value)}
            />
            {errors.paymentDate ? (
              <span className="editor-field__error">{errors.paymentDate}</span>
            ) : null}
          </label>
        </div>

        <label className="editor-field">
          <span className="editor-field__label">Notes</span>
          <textarea
            className="editor-input editor-input--textarea"
            rows={4}
            value={values.notes}
            onChange={(event) => updateValue('notes', event.target.value)}
          />
        </label>

        <div className="editor-panel__actions">
          <Button type="submit" variant="primary">
            {isEditing ? 'Save Payment' : 'Create Payment'}
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </div>
      </form>
    </Panel>
  );
}
