<?php

namespace visitor\viewmodels;

use Yii;
use visitor\helpers\RegistryHelper;

class RegistryViewModel
{

    private $fields;

    public function __construct()
    {
        $this->fields = [
            'participantName',
            'structure',
            'issueDate',
            'tin',
            'licenseNumber',
            'licenseDate',
            'licenseNote',
            'address',
            'contact',
            'chairmanSupervisoryBoard',
            'memberSupervisoryBoard',
            'chairmanAuditCommittee',
            'memberAuditCommittee',
            'singleLeader',
            'boardChairman',
            'boardMembers',
            'chiefAccountant',
            'internalAuditor',
            'directorsBoardChairman',
            'directorsBoardMember',
            'internalAuditServiceHead',
            'responsibleActuary',
            'headInternalAuditDepartment',
            'internalAuditDepartmentEmployee',
            'director',
            'directorsDeputyBoard',
            'directorsBoardIndependentMember',
            'commissionInspectionChairman',
            'commissionInspectionDeputy',
            'deputyChiefAccountantWithSignRight',
            'headAccountingService',
            'managementBoardResponsibleMember',
            'auditCommissionIndependentMember',
            'boardDeputyChairman',
            'inspectionCommissionMember',
            'inspectionCommissionMember',
            'registerAddress',
            'actualAddress',
        ];
    }


    public function renderRegistryItem($item)
    {
        $fields = $this->fields;
        $firstField = reset($fields);
        $lastField = end($fields);

        foreach ($fields as $field) {

            if ($item[$firstField][Yii::$app->language]['value'] != null) {
                if ($field === $firstField) {
                    echo '<dt>' . $item[$field][Yii::$app->language]['value'] . '</dt>';
                    echo '<dd>';
                    echo '<table>';
                    echo '<tbody>';
                } elseif ($field === 'contact') {
                    echo '<tr>';
                    echo '<td>' . Yii::t('app', 'Contact information') . '</td>';
                    echo '<td>';
                    foreach ($item['contact'] as $contact) {
                        RegistryHelper::printContact($contact[Yii::$app->language]['label'], $contact[Yii::$app->language]['value']);
                    }
                    echo '</td>';
                    echo '</tr>';
                } else {
                    RegistryHelper::printField($item[$field][Yii::$app->language]['label'], $item[$field][Yii::$app->language]['value']);
                    if ($field === $lastField) {
                        echo '</tbody>';
                        echo '</table>';
                        echo '</dd>';
                    }
                }
            }
        }
    }

    public function renderRegistryItemList($item)
    {
        echo '<li>';
        echo $item['participantName'][Yii::$app->language]['value'];
        echo '</li>';
    }

}