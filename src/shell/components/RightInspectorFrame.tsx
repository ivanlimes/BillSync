import { createCalculationSnapshotSelector } from '@/calculations';
import {
  appActions,
  selectPaymentsForBill,
  selectPreferences,
  selectSelectedBill,
  useAppDispatch,
  useAppStore,
} from '@/store';
import { Button, Panel } from '@/ui/primitives';
import { formatCurrency } from '@/utils';

const selectInspectorSnapshot = createCalculationSnapshotSelector();

export function RightInspectorFrame() {
  const selectedBill = useAppStore(selectSelectedBill);
  const paymentsForSelectedBill = useAppStore((state) =>
    selectPaymentsForBill(state, state.ui.selectedBillId),
  );
  const snapshot = useAppStore(selectInspectorSnapshot);
  const preferences = useAppStore(selectPreferences);
  const dispatch = useAppDispatch();

  return (
    <aside className="shell-right-inspector" aria-label="Inspector">
      <div className="shell-right-inspector__header">
        <h2 className="shell-pane-title">Inspector</h2>
        <p className="shell-pane-caption">
          Selected-bill details, payment history, and explicit edit actions only.
        </p>
      </div>

      <div className="shell-right-inspector__content">
        {selectedBill === null ? (
          <div className="inspector-empty-state">
            <Panel className="screen-scaffold__panel" tone="surface" padding="lg">
              <h3>No bill selected</h3>
              <p>Select a bill in the center workspace before opening edit flows.</p>
            </Panel>

            <Panel className="screen-scaffold__panel" tone="dense" padding="lg">
              <h3>Inspector ownership</h3>
              <ul className="screen-scaffold__list">
                <li>Selected-bill summary</li>
                <li>Current-cycle details</li>
                <li>Payment history and quick actions</li>
              </ul>
            </Panel>
          </div>
        ) : (
          <div className="inspector-selected-state">
            <Panel className="inspector-selected-state__section" tone="surface" padding="lg">
              <h3>{selectedBill.name}</h3>
              <p>{selectedBill.category}</p>
              <p className="shell-pane-caption">{selectedBill.payerLabel ?? 'Household owner not assigned yet'}</p>
            </Panel>

            <Panel className="inspector-selected-state__section" tone="dense" padding="lg">
              <h3>Bill summary</h3>
              <dl className="inspector-key-value">
                <dt>Expected amount</dt>
                <dd>{formatCurrency(selectedBill.expectedAmount)}</dd>
                <dt>Frequency</dt>
                <dd>{selectedBill.frequency}</dd>
                <dt>Next due</dt>
                <dd>{selectedBill.nextDueDate}</dd>
                <dt>AutoPay</dt>
                <dd>{selectedBill.autopayEnabled ? 'On' : 'Off'}</dd>
                <dt>Priority</dt>
                <dd>{selectedBill.priority}</dd>
                <dt>Classification</dt>
                <dd>{selectedBill.classification}</dd>
              </dl>
            </Panel>

            <Panel className="inspector-selected-state__section" tone="surface" padding="lg">
              <h3>Current cycle details</h3>
              <dl className="inspector-key-value">
                <dt>Actual paid</dt>
                <dd>{formatCurrency(snapshot.expectedVsActualDeltas.find((item) => item.billId === selectedBill.id)?.actualAmount ?? 0)}</dd>
                <dt>Expected vs actual</dt>
                <dd>{formatCurrency(snapshot.expectedVsActualDeltas.find((item) => item.billId === selectedBill.id)?.deltaAmount ?? selectedBill.expectedAmount)}</dd>
                <dt>Status</dt>
                <dd>{getInspectorStatusLabel(selectedBill.id, snapshot)}</dd>
                <dt>Reminder state</dt>
                <dd>{selectedBill.autopayEnabled ? 'AutoPay covers timing.' : 'Manual timing awareness only.'}</dd>
              </dl>
            </Panel>

            <Panel className="inspector-selected-state__section" tone="surface" padding="lg">
              <h3>Quick actions</h3>
              <div className="screen-inline-actions screen-inline-actions--stacked">
                <Button onClick={() => dispatch(appActions.openBillWorkspace({ billId: selectedBill.id, editor: 'bill-edit' }))}>Edit Bill</Button>
                <Button onClick={() => dispatch(appActions.openBillWorkspace({ billId: selectedBill.id, editor: 'payment-create' }))}>
                  Add Payment
                </Button>
                <Button onClick={() => dispatch(appActions.archiveBill(selectedBill.id))}>Archive Bill</Button>
              </div>
            </Panel>

            <Panel className="inspector-selected-state__section" tone="dense" padding="lg">
              <h3>Payment history</h3>
              {paymentsForSelectedBill.length === 0 ? (
                <p>No payments recorded yet.</p>
              ) : (
                <div className="payment-history__list">
                  {paymentsForSelectedBill.map((payment) => (
                    <button
                      key={payment.id}
                      type="button"
                      className="payment-history__row"
                      onClick={() => {
                        dispatch(appActions.openPaymentEditor({ billId: payment.billId, paymentId: payment.id }));
                      }}
                    >
                      <span>
                        {payment.paymentDate} · {payment.paymentType}
                      </span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </button>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="inspector-selected-state__section" tone="surface" padding="lg">
              <h3>Support facts</h3>
              <dl className="inspector-key-value">
                <dt>Default filter</dt>
                <dd>{preferences.defaultFilter}</dd>
                <dt>Payment link</dt>
                <dd>{selectedBill.paymentUrl ?? 'Not set'}</dd>
                <dt>Renewal</dt>
                <dd>{selectedBill.renewalBehavior ?? (selectedBill.frequency === 'annual' ? 'Annual renewal' : 'Standard cycle')}</dd>
              </dl>
            </Panel>

            {selectedBill.notes ? (
              <Panel className="inspector-selected-state__section" tone="surface" padding="lg">
                <h3>Notes</h3>
                <p>{selectedBill.notes}</p>
              </Panel>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}

function getInspectorStatusLabel(billId: string, snapshot: ReturnType<typeof selectInspectorSnapshot>) {
  const dueSummary = snapshot.nextDueLogic.find((item) => item.billId === billId);

  if (!dueSummary) {
    return 'No current-cycle due summary';
  }

  if (dueSummary.actualAmount <= 0) {
    return 'Unpaid';
  }

  if (dueSummary.unpaidAmount > 0) {
    return 'Partially paid';
  }

  return 'Paid';
}
