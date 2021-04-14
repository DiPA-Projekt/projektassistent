import React from 'react';
import { Button, Checkbox, Tag } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

const onReset = () => {
  console.log('reset');
};

export function SelectionArea(props: { onShowAllChange: (e: CheckboxChangeEvent) => void }): JSX.Element {
  return (
    <>
      <div className="sticky-wrapper" style={{ padding: '24px' }}>
        <div>
          <Checkbox onChange={props.onShowAllChange}>
            Auch Elemente zeigen, die für das Projekt nicht relevant sind
          </Checkbox>
        </div>
        <div style={{ marginTop: '10px' }}>
          <Checkbox checked={true}>
            Alle <Tag color="blue">Produktvorlagen</Tag>auswählen
          </Checkbox>
        </div>
        <div>
          <Checkbox indeterminate={true}>
            Alle <Tag color="green">Themenbeschreibungen</Tag>auswählen
          </Checkbox>
        </div>
        <div>
          <Checkbox>
            Alle <Tag color="red">Mustertexte</Tag>auswählen
          </Checkbox>
        </div>
        <div>
          <Button type="primary" htmlType="submit" style={{ marginRight: '8px', marginTop: '20px' }}>
            Vorlagen erzeugen
          </Button>
          <Button htmlType="button" onClick={onReset} style={{ marginTop: '20px' }}>
            Zurücksetzen
          </Button>
        </div>
      </div>
    </>
  );
}
