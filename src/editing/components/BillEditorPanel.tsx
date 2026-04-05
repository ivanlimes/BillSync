import { useEffect, useState, type FormEvent } from 'react';
import {
  appActions,
  selectEditingState,
  selectSelectedBill,
  useAppDispatch,
  useAppStore,
} from '@/store';
import type { BillClassification, BillFrequency, BillPriority, RecurringBill } from '@/domain';
import { Button, Panel } from '@/ui/primitives';
import { createId } from '@/editing/utils/createId';
import {
  defaultBillFormValues,
  getBillFormValues,
  validateBillForm,
  type BillFormValues,
} from '@/editing/forms/billForm';

const frequencyOptions: BillFrequency[] = ['monthly', 'quarterly', 'semiannual', 'annual', 'custom'];
const classificationOptions: BillClassification[] = ['fixed', 'variable'];
const priorityOptions: BillPriority[] = ['essential', 'optional'];

export function BillEditorPanel() {
  const editingState = useAppStore(selectEditingState);
  const selectedBill = useAppStore(selectSelectedBill);
  const dispatch = useAppDispatch();

  const billForEdit = editingState.kind === 'bill-edit' ? selectedBill : null;

  const [values, setValues] = useState<BillFormValues>(() =>
    editingState.kind === 'bill-create' ? defaultBillFormValues : getBillFormValues(billForEdit),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof BillFormValues, string>>>({});

  useEffect(() => {
    setValues(editingState.kind === 'bill-create' ? defaultBillFormValues : getBillFormValues(billForEdit));
    setErrors({});
  }, [editingState.kind, billForEdit]);

  if (editingState.kind !== 'bill-create' && editingState.kind !== 'bill-edit') {
    return null;
  }

  const isEditing = editingState.kind === 'bill-edit' && billForEdit !== null;

  function updateValue<TKey extends keyof BillFormValues>(key: TKey, nextValue: BillFormValues[TKey]) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  function handleCancel() {
    dispatch(appActions.closeEditor());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateBillForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const normalized: Omit<RecurringBill, 'id'> = {
      name: values.name.trim(),
      category: values.category.trim(),
      expectedAmount: Number(values.expectedAmount),
      frequency: values.frequency,
      nextDueDate: values.nextDueDate,
      autopayEnabled: values.autopayEnabled,
      classification: values.classification,
      priority: values.priority,
      notes: values.notes.trim() === '' ? undefined : values.notes.trim(),
      state: 'active',
    };

    if (isEditing && billForEdit) {
      dispatch(appActions.updateBill(billForEdit.id, normalized));
      dispatch(appActions.selectBill(billForEdit.id));
    } else {
      const newBillId = createId('bill');
      dispatch(
        appActions.addBill({
          id: newBillId,
          ...normalized,
        }),
      );
      dispatch(appActions.selectBill(newBillId));
    }

    dispatch(appActions.closeEditor());
  }

  return (
    <Panel className="editor-panel" tone="surface" padding="lg">
      <div className="editor-panel__header">
        <div>
          <h3>{isEditing ? 'Edit Bill' : 'Add Bill'}</h3>
          <p className="editor-panel__caption">
            Save updates canonical bill data only. Forecast and totals recalculate from derived selectors.
          </p>
        </div>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="editor-form__grid editor-form__grid--two-column">
          <label className="editor-field">
            <span className="editor-field__label">Bill name</span>
            <input
              className="editor-input"
              value={values.name}
              onChange={(event) => updateValue('name', event.target.value)}
            />
            {errors.name ? <span className="editor-field__error">{errors.name}</span> : null}
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Category</span>
            <input
              className="editor-input"
              value={values.category}
              onChange={(event) => updateValue('category', event.target.value)}
            />
            {errors.category ? <span className="editor-field__error">{errors.category}</span> : null}
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Expected amount</span>
            <input
              className="editor-input"
              inputMode="decimal"
              value={values.expectedAmount}
              onChange={(event) => updateValue('expectedAmount', event.target.value)}
            />
            {errors.expectedAmount ? (
              <span className="editor-field__error">{errors.expectedAmount}</span>
            ) : null}
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Next due date</span>
            <input
              className="editor-input"
              type="date"
              value={values.nextDueDate}
              onChange={(event) => updateValue('nextDueDate', event.target.value)}
            />
            {errors.nextDueDate ? (
              <span className="editor-field__error">{errors.nextDueDate}</span>
            ) : null}
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Frequency</span>
            <select
              className="editor-input"
              value={values.frequency}
              onChange={(event) => updateValue('frequency', event.target.value as BillFrequency)}
            >
              {frequencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="editor-field">
            <span className="editor-field__label">AutoPay</span>
            <select
              className="editor-input"
              value={values.autopayEnabled ? 'true' : 'false'}
              onChange={(event) => updateValue('autopayEnabled', event.target.value === 'true')}
            >
              <option value="false">Off</option>
              <option value="true">On</option>
            </select>
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Classification</span>
            <select
              className="editor-input"
              value={values.classification}
              onChange={(event) =>
                updateValue('classification', event.target.value as BillClassification)
              }
            >
              {classificationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Priority</span>
            <select
              className="editor-input"
              value={values.priority}
              onChange={(event) => updateValue('priority', event.target.value as BillPriority)}
            >
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
            {isEditing ? 'Save Bill' : 'Create Bill'}
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </div>
      </form>
    </Panel>
  );
}
